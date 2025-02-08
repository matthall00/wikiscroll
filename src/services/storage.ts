export type StorageType = 'localStorage' | 'indexedDB';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  thumbnail?: string;
  savedAt?: number;
  viewedAt?: number;
}

interface Interest {
  name: string;
  addedAt: number;
}

interface UserPreferences {
  interests: Interest[];
  theme?: 'light' | 'dark';
}

class StorageService {
  private static instance: StorageService;
  private db: IDBDatabase | null = null;
  private dbName: string;
  private dbVersion: number;

  private constructor() {
    this.dbName = 'WikiScrollDB';
    this.dbVersion = 1;
    this.initIndexedDB();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('savedArticles')) {
          db.createObjectStore('savedArticles', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('viewedArticles')) {
          const viewedStore = db.createObjectStore('viewedArticles', { keyPath: 'id' });
          viewedStore.createIndex('viewedAt', 'viewedAt');
        }
      };
    });
  }

  // Article methods
  async saveArticle(article: Article): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savedArticles'], 'readwrite');
      const store = transaction.objectStore('savedArticles');
      
      const request = store.put({
        ...article,
        savedAt: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSavedArticles(): Promise<Article[]> {
    if (!this.db) await this.initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savedArticles'], 'readonly');
      const store = transaction.objectStore('savedArticles');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSavedArticle(articleId: number): Promise<void> {
    if (!this.db) await this.initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savedArticles'], 'readwrite');
      const store = transaction.objectStore('savedArticles');
      const request = store.delete(articleId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // History methods
  async addToHistory(article: Article): Promise<void> {
    if (!this.db) await this.initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['viewedArticles'], 'readwrite');
      const store = transaction.objectStore('viewedArticles');
      
      const request = store.put({
        ...article,
        viewedAt: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getHistory(): Promise<Article[]> {
    if (!this.db) await this.initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['viewedArticles'], 'readonly');
      const store = transaction.objectStore('viewedArticles');
      const request = store.getAll();

      request.onsuccess = () => {
        const articles = request.result;
        articles.sort((a, b) => (b.viewedAt || 0) - (a.viewedAt || 0));
        resolve(articles);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearHistory(): Promise<void> {
    if (!this.db) await this.initIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['viewedArticles'], 'readwrite');
      const store = transaction.objectStore('viewedArticles');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Preferences methods
  setPreferences(prefs: Partial<UserPreferences>): void {
    const currentPrefs = this.getPreferences();
    const updatedPrefs = { ...currentPrefs, ...prefs };
    localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
  }

  getPreferences(): UserPreferences {
    const prefsString = localStorage.getItem('userPreferences');
    if (!prefsString) {
      return { interests: [] };
    }
    return JSON.parse(prefsString);
  }

  // Interest methods
  addInterest(interest: string): void {
    const prefs = this.getPreferences();
    if (!prefs.interests.some(i => i.name === interest)) {
      prefs.interests.push({
        name: interest,
        addedAt: Date.now()
      });
      this.setPreferences(prefs);
    }
  }

  removeInterest(interest: string): void {
    const prefs = this.getPreferences();
    prefs.interests = prefs.interests.filter(i => i.name !== interest);
    this.setPreferences(prefs);
  }

  getInterests(): Interest[] {
    return this.getPreferences().interests;
  }
}

export default StorageService;