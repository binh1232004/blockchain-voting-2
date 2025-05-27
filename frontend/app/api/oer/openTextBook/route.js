// import { fetchToGetImgUrlOpenTextBook, encodeSlug } from "@/app/utils";
// import fs from 'fs';
// import path from 'path';
// export async function GET() {
//     const OER_API =
//         "https://open.umn.edu/opentextbooks/textbooks?format=json&license=Attribution&q=Programming";
//     const TIMEOUT_MS = 5000; // 5 seconds timeout
//     const processData = async (data) => {
//         for (let index = 0; index < data.length; index++) {
//             const element = data[index];
//             try {
//                 const imgUrl = await fetchToGetImgUrlOpenTextBook(element.url);
//                 element["img_url"] = imgUrl;
//             } catch (imgError) {
//                 console.warn(`Failed to fetch image for ${element.title}:`, imgError);
//                 element["img_url"] = ""; // fallback image
//             }
//             // store property slug in api to compare params.slug in dynamics routing
//             const slug = encodeSlug(element.title);
//             element["slug"] = slug;
//         }
//         return data;
//     };
//     try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

//         const res = await fetch(OER_API, {
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             signal: controller.signal,
//         });
//         clearTimeout(timeoutId);

//         const oer = await res.json();
//         const data = oer.data;
//         await  processData(data);
//         return Response.json({ data });
//     } catch (error) {

//          const filePath = path.join(process.cwd(), 'public', 'textbooks.json');
//         const fileData = fs.readFileSync(filePath, 'utf8');
//         const fallbackOer = JSON.parse(fileData);

//         const data = fallbackOer.data || fallbackOer;
//         await processData(data);

//         return Response.json({ data });
//     }
// }
import { fetchToGetImgUrlOpenTextBook, encodeSlug } from "@/app/utils";
import fs from "fs";
import path from "path";

export async function GET() {
    const OER_API =
        "https://open.umn.edu/opentextbooks/textbooks?format=json&license=Attribution&q=Programming";
    const TIMEOUT_MS = 5000; // 5 seconds timeout

    const processData = async (data) => {
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            const imgUrl = await fetchToGetImgUrlOpenTextBook(element.url);
            element["img_url"] = imgUrl;
            // store property slug in api to compare params.slug in dynamics routing
            const slug = encodeSlug(element.title);
            element["slug"] = slug;
        }
        return data;
    };

    const fetchWithTimeout = async (url, options, timeout) => {
        const controller = new AbortController();

        // Create a timeout promise that rejects
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                controller.abort();
                reject(new Error("Request timeout"));
            }, timeout);
        });

        // Create fetch promise
        const fetchPromise = fetch(url, {
            ...options,
            signal: controller.signal,
        });

        // Race between fetch and timeout
        return Promise.race([fetchPromise, timeoutPromise]);
    };

    try {
        console.log("Attempting to fetch from OER API...");

        const res = await fetchWithTimeout(
            OER_API,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
            TIMEOUT_MS
        );

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const oer = await res.json();
        const data = oer.data;

        console.log("Successfully fetched from OER API");
        await processData(data);
        return Response.json({ data });
    } catch (error) {
        console.log(
            "Error fetching from OER API, using fallback:",
            error.message
        );

        try {
            const filePath = path.join(
                process.cwd(),
                "public",
                "textbooks.json"
            );
            console.log("Reading fallback data from:", filePath);
            const fileData = fs.readFileSync(filePath, "utf8");
            const fallbackOer = JSON.parse(fileData);

            const data = fallbackOer.data || fallbackOer;
            await processData(data);

            console.log("Successfully used fallback data");
            return Response.json({
                data,
                fallback: true,
                error: error.message,
            });
        } catch (fallbackError) {
            console.error("Error reading fallback file:", fallbackError);
            return Response.json(
                { error: "Failed to fetch data and fallback failed" },
                { status: 500 }
            );
        }
    }
}
