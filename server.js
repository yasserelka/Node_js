const http = require('http');
const url = require('url');
const postManager = require('./postManager');

const PORT = 3000;

function parseJsonBody(request, callback) {
    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', () => {
        try {
            const data = body.trim() === '' ? {} : JSON.parse(body);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    });
}

const server = http.createServer((request, response) => {
    // Gestion des erreurs de requête pour éviter les coupures silencieuses
    request.on('error', (err) => {
        console.error('❌ Erreur de requête:', err.message);
        response.writeHead(500);
        response.end(JSON.stringify({ error: 'Erreur de requête' }));
    });

    response.on('error', (err) => {
        console.error('❌ Erreur de réponse:', err.message);
    });

    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const method = request.method;
    
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/json');

    if (method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
    }

    // GET /api/posts
    if (pathname === '/api/posts' && method === 'GET') {
        console.log('📥 Requête GET /api/posts reçue');
        postManager.getAllPosts((err, posts) => {
            if (err) {
                console.error('❌ Erreur lecture posts:', err);
                response.writeHead(500);
                response.end(JSON.stringify({ error: 'Erreur serveur' }));
            } else {
                response.writeHead(200);
                response.end(JSON.stringify(posts));
            }
        });
    }
    // GET /api/posts/:id
    else if (pathname.startsWith('/api/posts/') && method === 'GET') {
        const id = pathname.split('/').pop();
        postManager.getPost(id, (err, post) => {
            if (err || !post) {
                response.writeHead(404);
                response.end(JSON.stringify({ error: 'Post non trouvé' }));
            } else {
                response.writeHead(200);
                response.end(JSON.stringify(post));
            }
        });
    }
    // POST /api/posts
    else if (pathname === '/api/posts' && method === 'POST') {
        parseJsonBody(request, (err, data) => {
            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({ error: 'JSON invalide' }));
            }
            postManager.insertPost(data, (err, newPost) => {
                if (err) {
                    response.writeHead(500);
                    response.end(JSON.stringify({ error: 'Erreur serveur' }));
                } else {
                    response.writeHead(201);
                    response.end(JSON.stringify(newPost));
                }
            });
        });
    }
    // PUT /api/posts/:id
    else if (pathname.startsWith('/api/posts/') && method === 'PUT') {
        const id = pathname.split('/').pop();
        parseJsonBody(request, (err, data) => {
            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({ error: 'JSON invalide' }));
            }
            postManager.updatePost(id, data, (err, updatedPost) => {
                if (err) {
                    response.writeHead(err.message === 'Post non trouvé' ? 404 : 500);
                    response.end(JSON.stringify({ error: err.message || 'Erreur serveur' }));
                } else {
                    response.writeHead(200);
                    response.end(JSON.stringify(updatedPost));
                }
            });
        });
    }
    // DELETE /api/posts/:id
    else if (pathname.startsWith('/api/posts/') && method === 'DELETE') {
        const id = pathname.split('/').pop();
        postManager.deletePost(id, (err) => {
            if (err) {
                response.writeHead(err.message === 'Post non trouvé' ? 404 : 500);
                response.end(JSON.stringify({ error: err.message || 'Erreur serveur' }));
            } else {
                response.writeHead(200);
                response.end(JSON.stringify({ message: 'Post supprimé' }));
            }
        });
    }
    else {
        response.writeHead(404);
        response.end(JSON.stringify({ error: 'Route non trouvée' }));
    }
});

// Capture les erreurs globales du serveur
server.on('error', (err) => {
    console.error('❌ Erreur fatale du serveur:', err);
});

server.listen(PORT, () => {
    console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
});