import React, { useEffect, useState } from 'react';
import { Users, FolderTree, MessageSquare, TrendingUp, UserCheck, GraduationCap } from 'lucide-react';
import { dataService } from '../services/dataService';

const Overview: React.FC = () => {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalCategories: 0,
    totalSubCategories: 0,
    activeInterviews: 0,
    totalHRs: 0,
    totalExperts: 0
  });

  useEffect(() => {
    const interviews = dataService.getInterviews();
    const categories = dataService.getCategories();
    const subCategories = dataService.getSubCategories();
    const hrs = dataService.getHRs();
    const experts = dataService.getExperts();

    setStats({
      totalInterviews: interviews.length,
      totalCategories: categories.length,
      totalSubCategories: subCategories.length,
      activeInterviews: interviews.filter(i => i.status === 'active').length,
      totalHRs: hrs.length,
      totalExperts: experts.length
    });
  }, []);

  const statCards = [
    {
      title: 'Total Interviews',
      value: stats.totalInterviews,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Sub Categories',
      value: stats.totalSubCategories,
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Active Interviews',
      value: stats.activeInterviews,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'HR Personnel',
      value: stats.totalHRs,
      icon: UserCheck,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Experts',
      value: stats.totalExperts,
      icon: GraduationCap,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your interview system.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Interviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Interviews</h3>
          </div>
          <div className="p-6">
            {dataService.getInterviews().slice(0, 5).length > 0 ? (
              <div className="space-y-4">
                {dataService.getInterviews().slice(0, 5).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{interview.title}</p>
                      <p className="text-sm text-gray-500">{interview.difficulty} • {interview.duration} min</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      interview.status === 'active' ? 'bg-green-100 text-green-800' :
                      interview.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No interviews created yet</p>
            )}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dataService.getCategories().map((category) => {
                const subCategoriesCount = dataService.getSubCategories()
                  .filter(sub => sub.categoryId === category.id).length;
                
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <span className="text-sm text-gray-600">{subCategoriesCount} subcategories</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;