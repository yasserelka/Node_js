const https = require('https');
const fs = require('fs');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

function fetchPosts() {
    https.get(API_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const posts = JSON.parse(data);
            savePosts(posts);
        });
    }).on('error', (err) => {
        console.error('Erreur de récupération:', err.message);
    });
}

function savePosts(posts) {
    fs.writeFile('posts.json', JSON.stringify(posts, null, 2), (err) => {
        if (err) {
            console.error('Erreur lors de la sauvegarde:', err);
        } else {
            console.log('✅ Données sauvegardées avec succès dans posts.json');
        }
    });
}

fetchPosts();