import * as cheerio from 'cheerio';
import slugify from 'slugify';
import {marked} from 'marked';
/**
 * 
 * @param {string} websiteLink link of website open textbook library
 * @returns {Promise<String>} imgUrl of open textbook library
 */
export async function fetchToGetImgUrlOpenTextBook(websiteLink){
  if(!websiteLink)
      throw new Error('Need a string for websiteLink')
    // Fetch the HTML content of the web page to be scraped
    let imgUrl;
    try{
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(websiteLink, {
            signal: controller.signal,
            headers: {
                'Content-Type': 'text/html',
            },
        }); 
        const html = await response.text();

        // Load the HTML content into Cheerio
        const $ = cheerio.load(html);

        imgUrl = $("img.cover").attr('src');

    }catch(error){
        console.warn(`Error fetching image from ${websiteLink}:`, error);
        imgUrl = ""; // Fallback if there's an error
    }
  return imgUrl;
}
/**
 * 
 * @param {string} slug 
 * @returns {string} encoded slug
 */
export function encodeSlug(slug){
  if(!slug)
    throw new Error('Need a string for slug');
  return encodeURIComponent(slugify(slug)) 
}
/**
 * 
 * @param {string} urlArg 
 * @returns {Boolean}
 */
export function isValidUrl(urlArg){
  try {
    const url = new URL(urlArg);
  } catch(error){
    return false;
  }
  return true;
}
/**
 * 
 * @param {Int} oerA 
 * @param {Int} oerB 
 */
export function compareFnToGetDecreaseVote(oerA, oerB){
  return Number(oerB.vote) - Number(oerA.vote);
}
export const parseMarkdownCriteria = (markdown) => {
        const sections = {
            content: { title: "Learning Content", icon: "📚", criteria: [] },
            design: { title: "Design and Structure", icon: "🎨", criteria: [] },
            technical: {
                title: "Technical and Programming Elements",
                icon: "⚙️",
                criteria: [],
            },
            assessment: {
                title: "Assessment and Testing",
                icon: "✅",
                criteria: [],
            },
            usability: {
                title: "User-Friendliness and Learner Support",
                icon: "👥",
                criteria: [],
            },
        };

        // Use marked's lexer to parse the markdown into tokens
        const tokens = marked.lexer(markdown);
        let currentSection = null;

        tokens.forEach((token, index) => {
            // Check for section headers (## headings)
            if (token.type === "heading" && token.depth === 2) {
                const headerText = token.text.toLowerCase();
                if (
                    headerText.includes("learning content") ||
                    headerText.includes("a.")
                ) {
                    currentSection = "content";
                } else if (
                    headerText.includes("design") ||
                    headerText.includes("b.")
                ) {
                    currentSection = "design";
                } else if (
                    headerText.includes("technical") ||
                    headerText.includes("c.")
                ) {
                    currentSection = "technical";
                } else if (
                    headerText.includes("assessment") ||
                    headerText.includes("d.")
                ) {
                    currentSection = "assessment";
                } else if (
                    headerText.includes("user-friendliness") ||
                    headerText.includes("e.")
                ) {
                    currentSection = "usability";
                }
            }
            // Process table tokens
            if (token.type === "table" && currentSection) {
                const headers = token.header;
                const rows = token.rows;

                // Skip header row and process criteria rows
                rows.forEach((row) => {
                    // Access the text property of the first cell
                    const firstCell = row[0]?.text || row[0];
                    if (
                        firstCell &&
                        typeof firstCell === "string" &&
                        firstCell.includes("**") &&
                        !firstCell.includes("Criterion")
                    ) {
                        // Extract criterion title
                        let criterionTitle = firstCell
                            .replace(/\*\*/g, "")
                            .trim();

                        // Handle multi-line criteria with descriptions
                        if (criterionTitle.includes("*")) {
                            criterionTitle = criterionTitle
                                .split("*")[0]
                                .trim();
                        }

                        // Get the 5 rating descriptions (columns 1-5)
                        const descriptions = row.slice(1, 6).map((cell) => {
                            const cellText = cell?.text || cell;
                            return typeof cellText === "string"
                                ? cellText.trim()
                                : "";
                        });

                        // Only add if we have descriptions
                        if (
                            descriptions.length >= 5 &&
                            descriptions.some((desc) => desc.length > 0)
                        ) {
                            const key = criterionTitle
                                .toLowerCase()
                                .replace(/[^a-z0-9]/g, "")
                                .substring(0, 20);

                            sections[currentSection].criteria.push({
                                key,
                                title: criterionTitle,
                                descriptions: descriptions,
                            });
                        }
                    }
                });
            }
        });

        return sections;
    };
export const parseWeiIntoOERT = (weiValue) => {
    const voteInOERT = parseFloat(weiValue.toString()) / Math.pow(10, 18);
    const formattedVote = parseFloat(voteInOERT.toFixed(2)); // Round to 2 decimal
    return Number(formattedVote);
}