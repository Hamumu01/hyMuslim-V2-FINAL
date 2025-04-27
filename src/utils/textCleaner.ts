/**
 * Utility functions for cleaning and formatting text
 */

/**
 * Removes HTML tags, footnotes, and extra whitespace from text
 * 
 * @param text Input text that may contain HTML tags and footnotes
 * @returns Cleaned text without HTML tags and footnotes
 */
export const cleanQuranText = (text: string): string => {
  // Handle case where text might be undefined or null
  if (!text) return '';
  
  return text
    // Remove sup tags with content (footnotes)
    .replace(/<sup[^>]*>.*?<\/sup>/g, '')
    // Remove sup tags with foot_note attributes
    .replace(/<sup[^>]*foot_note=[^>]*>.*?<\/sup>/g, '')
    // Remove self-closing sup tags
    .replace(/<sup[^>]*\/>/g, '')
    // Remove other HTML tags with content
    .replace(/<[^>]*>.*?<\/[^>]*>/g, '')
    // Remove self-closing tags
    .replace(/<[^>]*\/>/g, '')
    // Remove opening and closing tags
    .replace(/<[^>]*>/g, '')
    // Remove footnote references like [1]
    .replace(/\[\d+\]/g, '')
    // Remove parentheses content like (1)
    .replace(/\(\d+\)/g, '')
    // Remove special footnote format like 'foot_note=134956'
    .replace(/foot_note=\d+/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove extra spaces
    .trim();
};

/**
 * Shortens text to a specific length and adds ellipsis if needed
 * 
 * @param text Input text to truncate
 * @param maxLength Maximum length of the output text
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
