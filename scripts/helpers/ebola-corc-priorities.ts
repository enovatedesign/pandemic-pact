import { uniqBy } from "lodash";
import { RawGrant } from "../types/generate";
import { priorityLabels, subPriorityLabels } from "./ebola-corc-label-mapping";

type PriorityData = {
    priorityValue: number
    subPriorityValue?: number
    label: string
}

export const prepareEbolaCorcPriorities = (grant: RawGrant) => {
    // The ebola corc priority keys start with priority01, priority02 etc 
    const partPriorityKeysToInclude = [
        'priority01',
        'priority02',
        'priority03',
        'priority04',
        'priority05',
        'priority06',
        'priority07',
        'priority08',
        'priority09',
        'priority10',
    ]
    
    // Get all the ebola corc priority keys
    const ebolaCorcPriorityKeys = Object.keys(grant).filter(key =>
        partPriorityKeysToInclude.some(prefix => key.startsWith(prefix))
    )
    
    // The ebola corc sub priority keys start with priority01_sub01, priority02_sub02 etc 
    const partSubPriorityKeysToInclude = [
        'priority01_sub01',
        'priority01_sub02',
        'priority01_sub03',
        'priority02_sub01',
        'priority02_sub02',
        'priority04_sub01',
        'priority04_sub02',
        'priority05_sub01',
        'priority05_sub02',
        'priority05_sub03',
        'priority07_sub01',
        'priority08_sub01',
        'priority08_sub02',
        'priority10_sub01',
        'priority10_sub02',
        'priority10_sub03',
    ]
    
    // Get all the ebola corc sub priority keys
    const ebolaCorcSubPriorityKeys = Object.keys(grant).filter(key =>
        partSubPriorityKeysToInclude.some(prefix => key.startsWith(prefix))
    )

    let grantData: Record<string, PriorityData[]> = {
        priorities: [],
        subPriorities: [],
    }
    
    // Loop over the ebola corc priority keys and add the priority to the grantData object
    ebolaCorcPriorityKeys.forEach(priorityKey => {
        if (grant[priorityKey] === '1' || grant[priorityKey] === 'NA') {
            const priorityValue = Number(priorityKey.split('_')[0].replace('priority', ''))
            grantData['priorities'].push({
                priorityValue,
                label: priorityLabels[priorityValue as keyof typeof priorityLabels],
            })
        }
    })
    
    // Loop over the ebola corc sub priority keys and if the value is 1, add the sub priority to the grantData object
    ebolaCorcSubPriorityKeys.forEach(subPriorityKey => {
        if (grant[subPriorityKey] === '1') {
            const priorityValue = Number(subPriorityKey.split('_')[0].replace('priority', ''))
            const subPriorityValue = Number(subPriorityKey.split('_')[1].replace('sub', ''))
            
            grantData['subPriorities'].push({
                priorityValue,
                subPriorityValue,
                label: subPriorityLabels[priorityValue][subPriorityValue]
            })
        }
    })

    // Remove duplicate priorities and sub priorities
    const uniqueGrantData = Object.fromEntries(
        Object.entries(grantData)
            .map(([key, array]) => {
                if (key === 'priorities') return [key, uniqBy(array, 'priorityValue')]
                if (key === 'subPriorities') return [key, uniqBy(array, sub => sub.subPriorityValue)]
                
                return [key, array]
            })  
            .filter(([_, array]) => array.length > 0)
    )
    
    return uniqueGrantData
}