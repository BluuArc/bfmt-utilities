/**
 * @description Generate a URL to display the image with the given unit filename.
 * @param baseContentUrl Base URL of the server.
 * @param fileName Name of the file that represents an image for a given unit.
 * @returns Generated URL based on the given content URL and file name.
 */
export default function getUnitImageUrl (baseContentUrl: string, fileName: string): string {
	return `${baseContentUrl || ''}/unit/img/${fileName || ''}`;
}
