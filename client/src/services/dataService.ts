import { Category, SubCategory, Interview } from '../types';
import { HR, Expert } from '../types';

class DataService {
  private readonly CATEGORIES_KEY = 'mock_interview_categories';
  private readonly SUBCATEGORIES_KEY = 'mock_interview_subcategories';
  private readonly INTERVIEWS_KEY = 'mock_interview_interviews';
  private readonly HRS_KEY = 'mock_interview_hrs';
  private readonly EXPERTS_KEY = 'mock_interview_experts';

  // Categories
  getCategories(): Category[] {
    const data = localStorage.getItem(this.CATEGORIES_KEY);
    return data ? JSON.parse(data) : this.getDefaultCategories();
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    categories.push(newCategory);
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    return categories[index];
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(filtered));
    // Also delete related subcategories
    const subcategories = this.getSubCategories().filter(sc => sc.categoryId !== id);
    localStorage.setItem(this.SUBCATEGORIES_KEY, JSON.stringify(subcategories));
    return true;
  }

  // SubCategories
  getSubCategories(): SubCategory[] {
    const data = localStorage.getItem(this.SUBCATEGORIES_KEY);
    return data ? JSON.parse(data) : this.getDefaultSubCategories();
  }

  createSubCategory(subcategory: Omit<SubCategory, 'id' | 'createdAt' | 'updatedAt'>): SubCategory {
    const subcategories = this.getSubCategories();
    const newSubCategory: SubCategory = {
      ...subcategory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    subcategories.push(newSubCategory);
    localStorage.setItem(this.SUBCATEGORIES_KEY, JSON.stringify(subcategories));
    return newSubCategory;
  }

  updateSubCategory(id: string, updates: Partial<SubCategory>): SubCategory | null {
    const subcategories = this.getSubCategories();
    const index = subcategories.findIndex(sc => sc.id === id);
    if (index === -1) return null;

    subcategories[index] = {
      ...subcategories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.SUBCATEGORIES_KEY, JSON.stringify(subcategories));
    return subcategories[index];
  }

  deleteSubCategory(id: string): boolean {
    const subcategories = this.getSubCategories();
    const filtered = subcategories.filter(sc => sc.id !== id);
    if (filtered.length === subcategories.length) return false;
    
    localStorage.setItem(this.SUBCATEGORIES_KEY, JSON.stringify(filtered));
    return true;
  }

  // Interviews
  getInterviews(): Interview[] {
    const data = localStorage.getItem(this.INTERVIEWS_KEY);
    return data ? JSON.parse(data) : [];
  }

  createInterview(interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Interview {
    const interviews = this.getInterviews();
    const newInterview: Interview = {
      ...interview,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    interviews.push(newInterview);
    localStorage.setItem(this.INTERVIEWS_KEY, JSON.stringify(interviews));
    return newInterview;
  }

  updateInterview(id: string, updates: Partial<Interview>): Interview | null {
    const interviews = this.getInterviews();
    const index = interviews.findIndex(i => i.id === id);
    if (index === -1) return null;

    interviews[index] = {
      ...interviews[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.INTERVIEWS_KEY, JSON.stringify(interviews));
    return interviews[index];
  }

  deleteInterview(id: string): boolean {
    const interviews = this.getInterviews();
    const filtered = interviews.filter(i => i.id !== id);
    if (filtered.length === interviews.length) return false;
    
    localStorage.setItem(this.INTERVIEWS_KEY, JSON.stringify(filtered));
    return true;
  }

  // HR Management
  getHRs(): HR[] {
    const data = localStorage.getItem(this.HRS_KEY);
    return data ? JSON.parse(data) : [];
  }

  createHR(hr: Omit<HR, 'id' | 'createdAt' | 'updatedAt'>): HR {
    const hrs = this.getHRs();
    const newHR: HR = {
      ...hr,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    hrs.push(newHR);
    localStorage.setItem(this.HRS_KEY, JSON.stringify(hrs));
    return newHR;
  }

  updateHR(id: string, updates: Partial<HR>): HR | null {
    const hrs = this.getHRs();
    const index = hrs.findIndex(hr => hr.id === id);
    if (index === -1) return null;

    hrs[index] = {
      ...hrs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.HRS_KEY, JSON.stringify(hrs));
    return hrs[index];
  }

  deleteHR(id: string): boolean {
    const hrs = this.getHRs();
    const filtered = hrs.filter(hr => hr.id !== id);
    if (filtered.length === hrs.length) return false;
    
    localStorage.setItem(this.HRS_KEY, JSON.stringify(filtered));
    return true;
  }

  // Expert Management
  getExperts(): Expert[] {
    const data = localStorage.getItem(this.EXPERTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  createExpert(expert: Omit<Expert, 'id' | 'createdAt' | 'updatedAt'>): Expert {
    const experts = this.getExperts();
    const newExpert: Expert = {
      ...expert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    experts.push(newExpert);
    localStorage.setItem(this.EXPERTS_KEY, JSON.stringify(experts));
    return newExpert;
  }

  updateExpert(id: string, updates: Partial<Expert>): Expert | null {
    const experts = this.getExperts();
    const index = experts.findIndex(expert => expert.id === id);
    if (index === -1) return null;

    experts[index] = {
      ...experts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.EXPERTS_KEY, JSON.stringify(experts));
    return experts[index];
  }

  deleteExpert(id: string): boolean {
    const experts = this.getExperts();
    const filtered = experts.filter(expert => expert.id !== id);
    if (filtered.length === experts.length) return false;
    
    localStorage.setItem(this.EXPERTS_KEY, JSON.stringify(filtered));
    return true;
  }

  private getDefaultCategories(): Category[] {
    const defaults = [
      {
        id: '1',
        name: 'Technical Skills',
        description: 'Programming and technical competencies',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Behavioral',
        description: 'Soft skills and behavioral questions',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(defaults));
    return defaults;
  }

  private getDefaultSubCategories(): SubCategory[] {
    const defaults = [
      {
        id: '1',
        name: 'JavaScript',
        description: 'JavaScript programming questions',
        categoryId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'React',
        description: 'React framework questions',
        categoryId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Leadership',
        description: 'Leadership and management questions',
        categoryId: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(this.SUBCATEGORIES_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

export const dataService = new DataService();