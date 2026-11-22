import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

interface BookRecord {
  id: string;
  title: string;
  author: string;
  rating: string;
}

const SEED_BOOKS: BookRecord[] = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    rating: '9',
  },
  {
    id: '2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    rating: '9',
  },
  {
    id: '3',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    rating: '10',
  },
  {
    id: '4',
    title: 'Deep Work',
    author: 'Cal Newport',
    rating: '8',
  },
  {
    id: '5',
    title: 'Automate the Boring Stuff with Python',
    author: 'Al Sweigart',
    rating: '9',
  },
];

let booksStore: BookRecord[] = SEED_BOOKS.map((book) => ({...book}));
let nextNumericId = 6;

function isValidMockApiUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.toLowerCase().endsWith('.mockapi.io') &&
      parsed.hostname.length > '.mockapi.io'.length
    );
  } catch {
    return false;
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get('/api/books', (_req, res) => {
    res.status(200).json(booksStore);
  });

  app.get('/api/books/:id', (req, res) => {
    const book = booksStore.find((item) => item.id === String(req.params.id));
    if (!book) {
      res.status(404).json('Not found');
      return;
    }
    res.status(200).json(book);
  });

  app.post('/api/books', (req, res) => {
    const body = req.body ?? {};
    const title = String(body.title ?? '').trim();
    const author = String(body.author ?? '').trim();
    const rating = String(body.rating ?? '').trim();

    if (!title || !author || !rating) {
      res.status(400).json({
        error: 'Validation error: title, author, and rating are required strings.',
      });
      return;
    }

    const newBook: BookRecord = {
      id: String(nextNumericId++),
      title,
      author,
      rating,
    };

    booksStore.push(newBook);
    res.status(201).json(newBook);
  });

  app.put('/api/books/:id', (req, res) => {
    const targetId = String(req.params.id);
    const index = booksStore.findIndex((item) => item.id === targetId);
    if (index === -1) {
      res.status(404).json('Not found');
      return;
    }

    const body = req.body ?? {};
    const title = String(body.title ?? '').trim();
    const author = String(body.author ?? '').trim();
    const rating = String(body.rating ?? '').trim();

    if (!title || !author || !rating) {
      res.status(400).json({
        error: 'Validation error: title, author, and rating are required strings.',
      });
      return;
    }

    const updatedBook: BookRecord = {
      id: targetId,
      title,
      author,
      rating,
    };

    booksStore[index] = updatedBook;
    res.status(200).json(updatedBook);
  });

  app.delete('/api/books/:id', (req, res) => {
    const targetId = String(req.params.id);
    const index = booksStore.findIndex((item) => item.id === targetId);
    if (index === -1) {
      res.status(404).json('Not found');
      return;
    }

    const [deleted] = booksStore.splice(index, 1);
    res.status(200).json(deleted);
  });

  app.post('/api/books/reset', (_req, res) => {
    booksStore = SEED_BOOKS.map((book) => ({...book}));
    nextNumericId = 6;
    res.status(200).json(booksStore);
  });

  app.post('/api/proxy', async (req, res) => {
    const {targetUrl, method = 'GET', body} = req.body ?? {};
    const upperMethod = String(method).toUpperCase();

    if (typeof targetUrl !== 'string' || !isValidMockApiUrl(targetUrl)) {
      res.status(400).json({
        error: 'Target URL must be a valid https://*.mockapi.io endpoint.',
      });
      return;
    }

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(upperMethod)) {
      res.status(400).json({
        error: 'Unsupported HTTP method. Use GET, POST, PUT, or DELETE.',
      });
      return;
    }

    const start = Date.now();
    try {
      const response = await fetch(targetUrl, {
        method: upperMethod,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body:
          upperMethod === 'POST' || upperMethod === 'PUT'
            ? JSON.stringify(body ?? {})
            : undefined,
      });

      const rawText = await response.text();
      let parsedData: unknown = rawText;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = rawText;
      }

      res.status(200).json({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        durationMs: Date.now() - start,
        data: parsedData,
      });
    } catch (error) {
      res.status(502).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to reach external MockAPI endpoint.',
      });
    }
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bookstore API Lab running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
