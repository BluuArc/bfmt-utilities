/**
 * @description Generate a URL to display the image with the given item thumbnail filename
 * @param baseContentUrl Base URL of the server
 * @param fileName name of the file that represents the thumbnail image for a given item
 * @returns generated URL based on the given content URL and file name
 */
export default function getItemImageUrl (baseContentUrl: string, fileName: string): string {
	return `${baseContentUrl || ''}/item/${fileName || ''}`;
}
