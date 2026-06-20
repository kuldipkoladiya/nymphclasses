export const STANDARDS = [
    "Playgroup",
    "Nursery",
    "Junior KG",
    "Senior KG",
    "Balvatika",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "Graduated"
];

/**
 * Returns the next standard in the sequence.
 * @param {string} currentStd 
 * @returns {string}
 */
export const getNextStandard = (currentStd) => {
    if (!currentStd) return "";
    const currentIndex = STANDARDS.indexOf(currentStd);
    if (currentIndex === -1) {
        // Fallback for numeric strings
        const num = parseInt(currentStd);
        if (!isNaN(num)) {
            if (num >= 12) return "Graduated";
            return String(num + 1);
        }
        return "Graduated";
    }
    if (currentIndex >= STANDARDS.length - 1) {
        return "Graduated"; // standard 12 or Graduated promotes to Graduated
    }
    return STANDARDS[currentIndex + 1];
};
