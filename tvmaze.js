"use strict";

// Constants for missing image URL and TVMaze API base URL
const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

// DOM elements
const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** 
 * Given a search term, search for TV shows that match that query.
 * Returns (promise) array of show objects: [{ id, name, summary, image }]
 * If no image URL given by API, use a default image URL.
 */
async function getShowsByTerm(term) {
    try {
        const response = await axios.get(`${TVMAZE_API_URL}search/shows`, {
            params: { q: term }
        });
        return response.data.map(({ show }) => ({
            id: show.id,
            name: show.name,
            summary: show.summary,
            image: show.image ? show.image.medium : MISSING_IMAGE_URL // Default image for missing images
        }));
    } catch (error) {
        console.error('Error fetching shows:', error);
        return []; // Return empty array on error
    }
}

/** 
 * Given a show ID, get episodes from API and return array of episode objects: [{ id, name, season, number }]
 */
async function getEpisodesOfShow(id) {
    try {
        const response = await axios.get(`${TVMAZE_API_URL}shows/${id}/episodes`);
        return response.data.map(episode => ({
            id: episode.id,
            name: episode.name,
            season: episode.season,
            number: episode.number
        }));
    } catch (error) {
        console.error('Error fetching episodes:', error);
        return []; // Return empty array on error
    }
}

/** 
 * Populate episodes into the #episodesList part of the DOM.
 * Show the episodes area (#episodesArea) which is initially hidden.
 */
function populateEpisodes(episodes) {
    $episodesList.empty(); // Clear existing episodes

    episodes.forEach(episode => {
        const $episode = $(`<li>${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>`);
        $episodesList.append($episode); // Append each episode as a list item
    });

    $episodesArea.show(); // Show the episodes area
}

/** 
 * Given list of shows, create markup for each and append to DOM.
 * Add "Episodes" button to each show card with click handler to fetch and display episodes.
 */
async function populateShows(shows) {
    $showsList.empty();

    shows.forEach(show => {
        const $show = $(`
            <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
                <div class="media">
                    <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
                    <div class="media-body">
                        <h5 class="text-primary">${show.name}</h5>
                        <div><small>${show.summary}</small></div>
                        <button class="btn btn-outline-light btn-sm Show-getEpisodes">
                            Episodes
                        </button>
                    </div>
                </div>
            </div>`
        );

        // Attach click event to the "Episodes" button
        $show.find('.Show-getEpisodes').on('click', async function() {
            const showId = $(this).closest('.Show').data('show-id');
            const episodes = await getEpisodesOfShow(showId);
            populateEpisodes(episodes);
        });

        $showsList.append($show);
    });
}

// Initial hide episodes area when the page loads
$episodesArea.hide();

// Handle search form submission: get shows from API and display
async function searchForShowAndDisplay() {
    const term = $("#searchForm-term").val();
    const shows = await getShowsByTerm(term);

    $episodesArea.hide(); // Hide episodes area when displaying new shows
    populateShows(shows);
}

// Event listener for form submission
$searchForm.on("submit", async function (evt) {
    evt.preventDefault(); // Prevent default form submission
    await searchForShowAndDisplay(); // Perform show search and display
});



/** 
 * Notes:
 * 
 * 1. getShowsByTerm(term):
 *    - Makes an AJAX request to TVMaze API to search for TV shows based on the provided term.
 *    - Maps the response data to extract id, name, summary, and image URL (or uses a default placeholder image if not available).
 * 
 * 2. populateShows(shows):
 *    - Dynamically generates HTML for each TV show retrieved.
 *    - Includes an "Episodes" button for each show card with a click handler to fetch and display episodes.
 * 
 * 3. getEpisodesOfShow(id):
 *    - Fetches episodes for a specific TV show ID from the TVMaze API.
 *    - Maps the response data to extract episode id, name, season, and episode number.
 * 
 * 4. populateEpisodes(episodes):
 *    - Populates the DOM with episode information for a selected show.
 *    - Shows the episodes area (#episodesArea) which is initially hidden.
 * 
 * 5. Event Handling:
 *    - Handles form submission to search for TV shows and display them using async functions and await for API calls.
 *    - Handles click events on the "Episodes" button to fetch episodes dynamically and display them in the UI.
 * 
 * 6. Overall:
 *    - The code uses Axios for asynchronous HTTP requests and jQuery for DOM manipulation.
 *    - Ensures error handling by logging errors to the console and providing fallbacks when data is unavailable (e.g., missing images).
 *    - Enhances user experience by allowing dynamic search, show display, and episode retrieval directly from the UI.
 */

// Received assistance from ChatGPT and all notes at bottom provided by ChatGPT for my future reference.