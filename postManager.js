const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, 'posts.json');

function getAllPosts(callback) {
    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) return callback(err, null);
        try {
            const posts = JSON.parse(data);
            callback(null, posts);
        } catch (parseError) {
            callback(parseError, null);
        }
    });
}

function getPost(id, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err, null);
        const post = posts.find(p => p.id === parseInt(id));
        callback(null, post || null);
    });
}

function insertPost(newPost, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err);
        // Générer un nouvel ID (max ID + 1)
        newPost.id = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        posts.push(newPost);
        savePosts(posts, callback);
    });
}

function updatePost(id, updatedPost, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err);
        const index = posts.findIndex(p => p.id === parseInt(id));
        if (index === -1) return callback(new Error('Post non trouvé'));
        
        posts[index] = { ...posts[index], ...updatedPost, id: parseInt(id) };
        savePosts(posts, callback);
    });
}

function deletePost(id, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err);
        const index = posts.findIndex(p => p.id === parseInt(id));
        if (index === -1) return callback(new Error('Post non trouvé'));
        
        posts.splice(index, 1);
        savePosts(posts, callback);
    });
}

function savePosts(posts, callback) {
    fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), (err) => {
        callback(err, posts);
    });
}

module.exports = {
    getAllPosts,
    getPost,
    insertPost,
    updatePost,
    deletePost
};