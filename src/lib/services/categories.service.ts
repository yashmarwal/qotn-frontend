import { api } from '../api';

export const categoriesService = {
  getAll: () => api.get<{ data: any[] }>('/categories'),
  getBySlug: (slug: string) => api.get<{ data: any }>(`/categories/${slug}`),
};
