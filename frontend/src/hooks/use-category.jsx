// use-category.js
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function useCategory() {
  const [categories, setCategories] = useState([]);     
  useEffect(() => {
    api.get('/category/categories')
       .then(res => setCategories(res.data.categories)) 
       .catch(() => setCategories([]));
  }, []);
  console.log("categories",categories);
  return categories;
}
