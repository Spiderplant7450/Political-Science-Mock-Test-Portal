/**
 * ============================================================================
 * REGISTRY.JS - Subject and Chapter Registry
 * ============================================================================
 * 
 * This file acts as the central directory for all subjects, books, and chapters
 * in the quiz application. It DOES NOT contain the actual questions - it only
 * maps chapter names to their respective data files.
 * 
 * Structure:
 * subjectsRegistry = {
 *   "Subject Name": {
 *     "Book Name": {
 *       "Chapter Name": {
 *         path: "relative/path/to/chapter/data.js",
 *         count: number of questions in this chapter
 *       }
 *     }
 *   }
 * }
 * 
 * Usage:
 * - Loaded on all pages to populate subject/chapter dropdowns
 * - Used to dynamically load chapter question files during test
 * ============================================================================
 */

const subjectsRegistry = {
    "Political Science": {
        "Contemporary World Politics": {
            "The End of Bipolarity": { path: "data/political-science/Contemporary World Politics/cwp-ch1-bipolarity.js", count: 78 },
            "Contemporary Centres of Power": { path: "data/political-science/Contemporary World Politics/cwp-ch2-centres-power.js", count: 100 },
            "Contemporary South Asia": { path: "data/political-science/Contemporary World Politics/cwp-ch3-south-asia.js", count: 154 },
            "International Organisations": { path: "data/political-science/Contemporary World Politics/cwp-ch4-un.js", count: 87 },
            "Security in the Contemporary World": { path: "data/political-science/Contemporary World Politics/cwp-ch5-security.js", count: 92 },
            "Environment and Natural Resources": { path: "data/political-science/Contemporary World Politics/cwp-ch6-environment.js", count: 119 },
            "Globalisation": { path: "data/political-science/Contemporary World Politics/cwp-ch7-globalisation.js", count: 21 }
        },
        "Politics in India Since Independence": {
            "Challenges of Nation-Building": { path: "data/political-science/Politics in India Since Independence/pisi-ch1-nation-building.js", count: 89 },
            "Era of One-Party Dominance": { path: "data/political-science/Politics in India Since Independence/pisi-ch2-one-party.js", count: 122 },
            "Politics of Planned Development": { path: "data/political-science/Politics in India Since Independence/pisi-ch3-planned-dev.js", count: 64 },
            "India's External Relations": { path: "data/political-science/Politics in India Since Independence/pisi-ch4-external-relations.js", count: 115 },
            "Challenges to and Restoration of the Congress System": { path: "data/political-science/Politics in India Since Independence/pisi-ch5-congress-restoration.js", count: 107 },
            "The Crisis of Democratic Order": { path: "data/political-science/Politics in India Since Independence/pisi-ch6-democratic-crisis.js", count: 84 },
            "Regional Aspirations": { path: "data/political-science/Politics in India Since Independence/pisi-ch7-regional-aspirations.js", count: 188 },
            "Recent Developments in Indian Politics": { path: "data/political-science/Politics in India Since Independence/pisi-ch8-recent-developments.js", count: 109 }
        }
    }
};

// Export for use in other JavaScript files
// Works in both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = subjectsRegistry;
}
