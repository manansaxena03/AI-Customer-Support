exports.analyzeTextMock = (text) => {
  const lowerText = text.toLowerCase();
  let sentiment = 'Neutral';
  let priority = 'Low';
  let intent = 'General Question';
  let category = 'Other';
  let emotion = 'Neutral';

  if (lowerText.includes('late') || lowerText.includes('delay') || lowerText.includes('hasn\'t arrived')) {
    category = 'Delivery';
    sentiment = 'Negative';
    priority = 'High';
    intent = 'Delayed Order';
    emotion = 'Frustrated';
  } else if (lowerText.includes('broken') || lowerText.includes('not working')) {
    category = 'Product Issue';
    sentiment = 'Negative';
    priority = 'High';
    intent = 'Product Defect';
    emotion = 'Angry';
  } else if (lowerText.includes('excellent') || lowerText.includes('good') || lowerText.includes('great')) {
    sentiment = 'Positive';
    emotion = 'Happy';
    intent = 'Feedback';
    category = 'Feedback';
  }

  const suggestedResponse = sentiment === 'Negative' 
    ? "We sincerely apologize for the inconvenience. We understand how frustrating this can be. Our support team is checking into your issue and will provide an update as soon as possible."
    : "Thank you for reaching out! We are glad to hear from you. If you have any further questions, feel free to ask.";

  return {
    category,
    sentiment,
    priority,
    intent,
    emotion,
    summary: `Customer is expressing ${sentiment.toLowerCase()} feedback regarding a ${category.toLowerCase()} issue.`,
    suggestedResponse
  };
};