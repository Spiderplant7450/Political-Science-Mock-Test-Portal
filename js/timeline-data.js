/**
 * TIMELINE-DATA.JS - Independent Registry & Global Initializer
 * This file contains the chapter structure for the timeline and initializes the data array.
 */

window.timelineData = [];

window.timelineRegistry = {
    "Contemporary World Politics": [
        "The End of Bipolarity",
        "Contemporary Centres of Power",
        "Contemporary South Asia",
        "International Organisations",
        "Security in the Contemporary World",
        "Environment and Natural Resources",
        "Globalisation"
    ],
    "Politics in India Since Independence": [
        "Challenges of Nation-Building",
        "Era of One-Party Dominance",
        "Politics of Planned Development",
        "India's External Relations",
        "Challenges to and Restoration of the Congress System",
        "The Crisis of Democratic Order",
        "Regional Aspirations",
        "Recent Developments in Indian Politics"
    ]
};

// Exporting for potential module usage
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        timelineData: window.timelineData,
        timelineRegistry: window.timelineRegistry
    };
}