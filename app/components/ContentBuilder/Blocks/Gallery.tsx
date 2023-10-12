// import Gallery from "components/common/content/Gallery";

export default function GalleryBlock({ block }) {
	const images = block.images;

	if (images) {
		// return <Gallery data={images} />;
		return null;
	} else {
		return null;
	}
}
