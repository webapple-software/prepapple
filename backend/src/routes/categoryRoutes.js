const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { collection, getDocs, setDoc, doc, deleteDoc } = require('firebase/firestore');

// Helper to clean subcategories array
const cleanSubcats = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => {
    if (!s) return '';
    if (typeof s === 'string') return s.trim();
    if (typeof s === 'object') return (s.name || s.title || s.id || s.label || String(s)).trim();
    return String(s).trim();
  }).filter(Boolean);
};

// Get all categories
router.get('/', async (req, res) => {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const categories = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        subcategories: cleanSubcats(data.subcategories)
      };
    });
    
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
    const cleaned = cleanSubcats(subcategories);
    await setDoc(doc(db, 'categories', catId), {
      title: title.trim(),
      icon: icon || 'Calculator',
      color: color || 'blue',
      hasSubcategories: cleaned.length > 0,
      subcategories: cleaned,
      created_at: new Date().toISOString()
    });
    res.status(201).json({ success: true, message: 'Category saved successfully' });
  } catch (error) {
    console.error('Error saving category:', error);
    res.status(500).json({ error: 'Failed to save category' });
  }
});

// Update subcategories of a category (PATCH)
router.patch('/:id/subcategories', async (req, res) => {
  const { id } = req.params;
  const { subcategories } = req.body;
  if (!Array.isArray(subcategories)) {
    return res.status(400).json({ error: 'subcategories must be an array' });
  }
  try {
    const { getDoc, updateDoc } = require('firebase/firestore');
    const rawId = id.trim();
    let catRef = doc(db, 'categories', rawId);
    let snap = await getDoc(catRef);
    if (!snap.exists()) {
      catRef = doc(db, 'categories', rawId.toLowerCase());
      snap = await getDoc(catRef);
    }
    if (!snap.exists()) {
      catRef = doc(db, 'categories', rawId.toUpperCase());
      snap = await getDoc(catRef);
    }
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const cleaned = cleanSubcats(subcategories);
    await updateDoc(catRef, {
      subcategories: cleaned,
      hasSubcategories: cleaned.length > 0
    });
    res.json({ success: true, message: 'Subcategories updated successfully', subcategories: cleaned });
  } catch (error) {
    console.error('Error updating subcategories:', error);
    res.status(500).json({ error: 'Failed to update subcategories' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rawId = id.trim();
    await deleteDoc(doc(db, 'categories', rawId)).catch(() => {});
    await deleteDoc(doc(db, 'categories', rawId.toLowerCase())).catch(() => {});
    await deleteDoc(doc(db, 'categories', rawId.toUpperCase())).catch(() => {});
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
