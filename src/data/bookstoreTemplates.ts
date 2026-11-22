import type {Book, ChecklistItem, ScriptConfig, ScriptMode} from '../types/bookstore';

export const PART_A_SEED_BOOKS: Book[] = [
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

export const DEFAULT_MOCKAPI_PLACEHOLDER =
  'https://YOUR_PROJECT_ID.mockapi.io/api/v1/books';

export const DEFAULT_SCRIPT_CONFIG: ScriptConfig = {
  apiUrl: DEFAULT_MOCKAPI_PLACEHOLDER,
  postBook: {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    rating: '10',
  },
  putTargetId: '2',
  putBook: {
    title: 'Clean Code (Updated Edition)',
    author: 'Robert C. Martin',
    rating: '10',
  },
  deleteTargetId: '4',
};

export const ASSIGNMENT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'a1',
    section: 'Part A: MockAPI Setup',
    label: 'Create project named Bookstore on mockapi.io',
    detail: 'Sign in at mockapi.io and initialize a new project called Bookstore.',
  },
  {
    id: 'a2',
    section: 'Part A: MockAPI Setup',
    label: 'Create books resource with string fields: id, title, author, rating',
    detail: 'Confirm all four schema fields use string type.',
  },
  {
    id: 'a3',
    section: 'Part A: MockAPI Setup',
    label: 'Seed 5 books via the Data tab using valid double-quoted JSON',
    detail: 'Copy the 5-book JSON array from the MockAPI Seed section and save.',
  },
  {
    id: 'a4',
    section: 'Part A: MockAPI Setup',
    label: 'Copy the books resource API URL',
    detail: 'Paste your endpoint URL into the API URL input so bookstore_api.py points directly to it.',
  },
  {
    id: 'b1',
    section: 'Part B: Python Script',
    label: 'a. GET all books with try/except HTTPError and .raise_for_status()',
    detail: 'Prints both HTTP status code and JSON response body.',
  },
  {
    id: 'b2',
    section: 'Part B: Python Script',
    label: 'b. POST 6th book using json= parameter (expect 201 Created)',
    detail: 'Sends dictionary payload with json= and prints status code and created record.',
  },
  {
    id: 'b3',
    section: 'Part B: Python Script',
    label: 'c. PUT updated book using f"{API_URL}/{book_id}" path segment',
    detail: 'Replaces title, author, and rating for an existing book ID.',
  },
  {
    id: 'b4',
    section: 'Part B: Python Script',
    label: 'd. DELETE book by id, then immediately GET same id to verify HTTP error',
    detail: 'Confirms 404 HTTPError is raised and caught cleanly after deletion.',
  },
  {
    id: 'c1',
    section: 'Bonus & Submission',
    label: 'Wrap operations into reusable functions (get_books, add_book, update_book, delete_book)',
    detail: 'Included by default in the Bonus Modular Python script mode.',
  },
  {
    id: 'c2',
    section: 'Bonus & Submission',
    label: 'Capture screenshot of mockapi.io Data tab after running bookstore_api.py',
    detail: 'Verify your final list shows the 6th book added, updated book modified, and deleted book removed.',
  },
  {
    id: 'c3',
    section: 'Bonus & Submission',
    label: 'Package bookstore_api.py and screenshot for LMS submission',
    detail: 'Download bookstore_api.py directly from the header or Python Script studio.',
  },
];

function pyEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function generateBookstorePythonScript(
  config: ScriptConfig,
  mode: ScriptMode,
): string {
  const apiUrl = config.apiUrl.trim() || DEFAULT_MOCKAPI_PLACEHOLDER;
  const postTitle = pyEscape(config.postBook.title);
  const postAuthor = pyEscape(config.postBook.author);
  const postRating = pyEscape(config.postBook.rating);
  const putId = pyEscape(config.putTargetId || '2');
  const putTitle = pyEscape(config.putBook.title);
  const putAuthor = pyEscape(config.putBook.author);
  const putRating = pyEscape(config.putBook.rating);
  const deleteId = pyEscape(config.deleteTargetId || '4');

  if (mode === 'sequential') {
    return `import requests

API_URL = "${pyEscape(apiUrl)}"


# 1a. GET all books
print("--- 1a. GET all books ---")
try:
    response = requests.get(API_URL, timeout=10)
    response.raise_for_status()
    print(f"Status Code: {response.status_code}")
    print("Response JSON:", response.json())
except requests.exceptions.HTTPError as err:
    print(f"HTTP Error during GET all books: {err}")


# 1b. POST a 6th new book
print("\\n--- 1b. POST a 6th new book ---")
new_book = {
    "title": "${postTitle}",
    "author": "${postAuthor}",
    "rating": "${postRating}",
}
try:
    response = requests.post(API_URL, json=new_book, timeout=10)
    response.raise_for_status()
    print(f"Status Code: {response.status_code}")
    print("Created Book JSON:", response.json())
except requests.exceptions.HTTPError as err:
    print(f"HTTP Error during POST book: {err}")


# 1c. PUT to replace an existing book by id
print("\\n--- 1c. PUT replace existing book (id=${putId}) ---")
book_id_to_update = "${putId}"
updated_book = {
    "title": "${putTitle}",
    "author": "${putAuthor}",
    "rating": "${putRating}",
}
try:
    response = requests.put(
        f"{API_URL}/{book_id_to_update}",
        json=updated_book,
        timeout=10,
    )
    response.raise_for_status()
    print(f"Status Code: {response.status_code}")
    print("Updated Book JSON:", response.json())
except requests.exceptions.HTTPError as err:
    print(f"HTTP Error during PUT book: {err}")


# 1d. DELETE one book by id, then immediately GET the same id to confirm HTTP error
print("\\n--- 1d. DELETE book (id=${deleteId}) and verify 404 ---")
book_id_to_delete = "${deleteId}"
try:
    delete_response = requests.delete(
        f"{API_URL}/{book_id_to_delete}",
        timeout=10,
    )
    delete_response.raise_for_status()
    print(f"DELETE Status Code: {delete_response.status_code}")
    print("Deleted Book JSON:", delete_response.json())
except requests.exceptions.HTTPError as err:
    print(f"HTTP Error during DELETE book: {err}")

print(f"Verifying deletion with GET {API_URL}/{book_id_to_delete}...")
try:
    verify_response = requests.get(
        f"{API_URL}/{book_id_to_delete}",
        timeout=10,
    )
    verify_response.raise_for_status()
    print(f"Unexpected success: {verify_response.status_code} {verify_response.json()}")
except requests.exceptions.HTTPError as err:
    print(f"Confirmed HTTP error after DELETE: {err} (Status Code: {err.response.status_code})")
`;
  }

  return `import requests

API_URL = "${pyEscape(apiUrl)}"


def get_books():
    """GET all books from the Bookstore API."""
    try:
        response = requests.get(API_URL, timeout=10)
        response.raise_for_status()
        print(f"[GET] Status Code: {response.status_code}")
        books = response.json()
        print(f"[GET] Books ({len(books)}):", books)
        return books
    except requests.exceptions.HTTPError as err:
        print(f"[GET] HTTP Error: {err}")
        return None


def get_book_by_id(book_id):
    """GET a single book by id to inspect or verify removal."""
    try:
        response = requests.get(f"{API_URL}/{book_id}", timeout=10)
        response.raise_for_status()
        print(f"[GET /{book_id}] Status Code: {response.status_code}")
        book = response.json()
        print(f"[GET /{book_id}] Book:", book)
        return book
    except requests.exceptions.HTTPError as err:
        status = err.response.status_code if err.response is not None else "Unknown"
        print(f"[GET /{book_id}] Confirmed HTTP Error ({status}): {err}")
        return None


def add_book(book):
    """POST a new book dictionary using json= and return the created resource."""
    try:
        response = requests.post(API_URL, json=book, timeout=10)
        response.raise_for_status()
        print(f"[POST] Status Code: {response.status_code}")
        created = response.json()
        print("[POST] Created Book:", created)
        return created
    except requests.exceptions.HTTPError as err:
        print(f"[POST] HTTP Error: {err}")
        return None


def update_book(book_id, book):
    """PUT replacement title, author, and rating values for a book by id."""
    try:
        response = requests.put(f"{API_URL}/{book_id}", json=book, timeout=10)
        response.raise_for_status()
        print(f"[PUT /{book_id}] Status Code: {response.status_code}")
        updated = response.json()
        print(f"[PUT /{book_id}] Updated Book:", updated)
        return updated
    except requests.exceptions.HTTPError as err:
        print(f"[PUT /{book_id}] HTTP Error: {err}")
        return None


def delete_book(book_id):
    """DELETE a book by id, then immediately GET that same id to confirm HTTP error."""
    try:
        response = requests.delete(f"{API_URL}/{book_id}", timeout=10)
        response.raise_for_status()
        print(f"[DELETE /{book_id}] Status Code: {response.status_code}")
        deleted = response.json()
        print(f"[DELETE /{book_id}] Deleted Book:", deleted)
    except requests.exceptions.HTTPError as err:
        print(f"[DELETE /{book_id}] HTTP Error: {err}")
        return False

    # Immediately try GET on the deleted id to confirm an HTTP error (404)
    print(f"Verifying deletion with GET {API_URL}/{book_id}...")
    result = get_book_by_id(book_id)
    return result is None


def main():
    print("=== 1a. GET all books ===")
    get_books()

    print("\\n=== 1b. POST 6th new book ===")
    sixth_book = {
        "title": "${postTitle}",
        "author": "${postAuthor}",
        "rating": "${postRating}",
    }
    add_book(sixth_book)

    print("\\n=== 1c. PUT update existing book ===")
    replacement_book = {
        "title": "${putTitle}",
        "author": "${putAuthor}",
        "rating": "${putRating}",
    }
    update_book("${putId}", replacement_book)

    print("\\n=== 1d. DELETE book and verify HTTP error ===")
    delete_book("${deleteId}")

    print("\\n=== Final Inventory Snapshot ===")
    get_books()


if __name__ == "__main__":
    main()
`;
}
