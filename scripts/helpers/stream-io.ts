import fs from 'fs-extra';
import zlib from 'zlib';
import StreamArray from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';

/**
 * Reads a large JSON (optionally gzipped) and executes a callback for each item.
 * Uses near-zero memory regardless of file size.
 */
export async function streamLargeJson(
    filePath: string, 
    onData: (item: any) => void | Promise<void>
): Promise<void> {
    // Build the pipeline steps as an array of Stream-like objects
    const pipelineSteps: any[] = [
        fs.createReadStream(filePath)
    ];

    if (filePath.endsWith('.gz')) {
        pipelineSteps.push(zlib.createGunzip());
    }

    pipelineSteps.push(StreamArray.withParser());

    const pipeline = chain(pipelineSteps);

    return new Promise((resolve, reject) => {
        pipeline.on('data', async (data) => {
            try {
                // stream-json's StreamArray emits objects with {key, value}
                await onData(data.value);
            } catch (err) {
                // Ensure we destroy the pipeline on error to prevent leaks
                pipeline.destroy();
                reject(err);
            }
        });

        pipeline.on('end', resolve);
        pipeline.on('error', reject);
    });
}

/**
 * Returns a helper to write items to a JSON array file one-by-one.
 */
export function createJsonArrayWriteStream(outputPath: string) {
    const writeStream = fs.createWriteStream(outputPath);
    let isFirst = true;

    writeStream.write('[');

    return {
        writeItem: (item: any) => {
            const prefix = isFirst ? '' : ',';
            writeStream.write(prefix + JSON.stringify(item));
            isFirst = false;
        },
        end: () => {
            return new Promise<void>((resolve, reject) => {
                writeStream.write(']', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        writeStream.end();
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                    }
                });
            });
        },
        stream: writeStream
    };
}