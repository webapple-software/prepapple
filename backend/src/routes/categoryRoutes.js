const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { collection, getDocs, setDoc, doc, deleteDoc } = require('firebase/firestore');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const categories = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort alphabetically by title
    categories.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create or update a category
router.post('/', async (req, res) => {
  const { id, title, icon, color, hasSubcategories, subcategories } = req.body;
  if (!id || !title) {
    return res.status(400).json({ error: 'Category ID and title are required' });
  }
  try {
    const catId = id.trim().toLowerCase();
    await setDoc(doc(db, 'categories', catId), {
      title: title.trim(),
      icon: icon || 'Calculator',
      color: color || 'blue',
      hasSubcategories: !!hasSubcategories,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      created_at: new Date().toISOString()
    });
    res.status(201).json({ success: true, message: 'Category saved successfully' });
  } catch (error) {
    console.error('Error saving category:', error);
    res.status(500).json({ error: 'Failed to save category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const catRef = doc(db, 'categories', id.trim().toLowerCase());
    await deleteDoc(catRef);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
