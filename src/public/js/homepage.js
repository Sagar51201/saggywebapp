// Replace 'YOUR_API_KEY' with your actual API key
const apiKey = 'cd559501983246a2b5f6ebfaaadbd0cc';
const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

// Fetch news data from the API
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Extract news articles from the response
    const articles = data.articles;

    // Display each news article on the webpage
    articles.forEach(article => {
      const articleContainer = document.createElement('div');
      articleContainer.classList.add('article-container');

      const title = document.createElement('h2');
      title.classList.add('article-title');
      title.textContent = article.title;

      const description = document.createElement('p');
      description.classList.add('article-description');
      description.textContent = article.description;

      const readMoreLink = document.createElement('a');
      readMoreLink.classList.add('btn', 'btn-read-more');
      readMoreLink.href = article.url;
      readMoreLink.textContent = 'Read More';

      articleContainer.appendChild(title);
      articleContainer.appendChild(description);
      articleContainer.appendChild(readMoreLink);

      document.getElementById('news-section').appendChild(articleContainer);
    });
  })
  .catch(error => console.error('Error fetching news:', error));
