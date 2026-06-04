import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Settings, FileText, Download, BarChart3, LogOut, User as UserIcon, Award } from 'lucide-react';
import { questionBank, addQuestion, updateQuestion, deleteQuestion } from '../data/questionBank';
import { getAllUsers, getAllProgress } from '../services/userService';
import { Question } from '../types';
import { toast } from 'sonner';

interface AdminPanelProps {
  onNavigate: (view: 'home' | 'profile' | 'leaderboard') => void;
  onLogout: () => void;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  category: 'achievement' | 'milestone' | 'special';
}

export function AdminPanel({ onNavigate, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'questions' | 'rewards' | 'report'>('questions');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'question' | 'reward', id: string } | null>(null);
  const [showAddReward, setShowAddReward] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(15); // Show 15 questions per page
  
  // Form state
  const [formData, setFormData] = useState({
    topic: 'arithmetic',
    difficulty: 'easy',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 10,
  });

  // Reward form state
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    pointsRequired: 100,
    category: 'achievement' as 'achievement' | 'milestone' | 'special',
  });

  // Validation error states
  const [questionErrors, setQuestionErrors] = useState({
    question: false,
    options: [false, false, false, false],
    explanation: false,
  });

  const [rewardErrors, setRewardErrors] = useState({
    name: false,
    description: false,
  });

  // Mock rewards data
  const [rewards, setRewards] = useState<Reward[]>([
    { id: '1', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', pointsRequired: 10, category: 'achievement' },
    { id: '2', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: '🏆', pointsRequired: 100, category: 'milestone' },
    { id: '3', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '⭐', pointsRequired: 50, category: 'achievement' },
  ]);

  const users = getAllUsers();
  const progress = getAllProgress();

  const tabs = [
    { id: 'questions', name: 'Question Bank', icon: BookOpen },
    { id: 'rewards', name: 'Rewards', icon: Award },
    { id: 'report', name: 'System Report', icon: FileText },
  ] as const;

  // When editingQuestion changes, populate the form and show the modal
  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        topic: editingQuestion.topic,
        difficulty: editingQuestion.difficulty,
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        points: editingQuestion.points,
      });
      setShowAddQuestion(true);
    }
  }, [editingQuestion]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question.trim()) {
      setQuestionErrors(prev => ({ ...prev, question: true }));
      toast.error('Please enter a question');
      return;
    } else {
      setQuestionErrors(prev => ({ ...prev, question: false }));
    }
    
    if (formData.options.some(opt => !opt.trim())) {
      setQuestionErrors(prev => ({ ...prev, options: formData.options.map(opt => !opt.trim()) }));
      toast.error('Please fill all answer options');
      return;
    } else {
      setQuestionErrors(prev => ({ ...prev, options: [false, false, false, false] }));
    }
    
    if (!formData.explanation.trim()) {
      setQuestionErrors(prev => ({ ...prev, explanation: true }));
      toast.error('Please enter an explanation');
      return;
    } else {
      setQuestionErrors(prev => ({ ...prev, explanation: false }));
    }

    try {
      if (editingQuestion) {
        updateQuestion(editingQuestion.id, {
          topic: formData.topic as any,
          difficulty: formData.difficulty as any,
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          points: formData.points,
        });

        toast.success('Question updated successfully!');
        setEditingQuestion(null);
      } else {
        addQuestion({
          topic: formData.topic as any,
          difficulty: formData.difficulty as any,
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          points: formData.points,
        });

        toast.success('Question added successfully!');
      }
      
      setShowAddQuestion(false);
      
      // Reset form
      setFormData({
        topic: 'arithmetic',
        difficulty: 'easy',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 10,
      });
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const generateSystemReport = () => {
    const totalQuestions = questionBank.length;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.role === 'student').length;
    const totalQuizzesTaken = Object.values(progress).reduce((sum, p) => sum + p.quizzesTaken, 0);
    const totalPoints = Object.values(progress).reduce((sum, p) => sum + p.totalPoints, 0);
    const avgQuizzesPerUser = activeUsers > 0 ? (totalQuizzesTaken / activeUsers).toFixed(1) : 0;
    const avgPointsPerUser = activeUsers > 0 ? (totalPoints / activeUsers).toFixed(0) : 0;

    const reportData = {
      generatedAt: new Date().toLocaleString(),
      overview: {
        totalQuestions,
        totalUsers,
        activeStudents: activeUsers,
        totalQuizzesTaken,
        totalPoints,
      },
      averages: {
        quizzesPerUser: avgQuizzesPerUser,
        pointsPerUser: avgPointsPerUser,
      },
      questionsByTopic: {
        arithmetic: questionBank.filter(q => q.topic === 'arithmetic').length,
        algebra: questionBank.filter(q => q.topic === 'algebra').length,
        geometry: questionBank.filter(q => q.topic === 'geometry').length,
        statistics: questionBank.filter(q => q.topic === 'statistics').length,
      },
      questionsByDifficulty: {
        easy: questionBank.filter(q => q.difficulty === 'easy').length,
        medium: questionBank.filter(q => q.difficulty === 'medium').length,
        hard: questionBank.filter(q => q.difficulty === 'hard').length,
      },
      topUsers: users
        .filter(u => u.role === 'student')
        .map(u => ({
          username: u.username,
          level: u.level,
          points: progress[u.id]?.totalPoints || 0,
          quizzes: progress[u.id]?.quizzesTaken || 0,
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5),
    };

    const reportText = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('System report downloaded!');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-4 md:p-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 md:w-12 md:h-12" />
              <div>
                <h1 className="text-white text-xl md:text-3xl">Admin Panel</h1>
                <p className="text-purple-100 text-sm">Manage system</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick Nav Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('profile')}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2 border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1); // Reset to first page when switching tabs
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Question Bank Tab */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-900 mb-1">Question Bank</h2>
                <p className="text-gray-600">Total Questions: {questionBank.length}</p>
              </div>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            {/* Question Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 mb-1 text-sm">Arithmetic</p>
                <p className="text-gray-900 text-sm">
                  {questionBank.filter(q => q.topic === 'arithmetic').length} questions
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-green-600 mb-1 text-sm">Algebra</p>
                <p className="text-gray-900 text-sm">
                  {questionBank.filter(q => q.topic === 'algebra').length} questions
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-600 mb-1 text-sm">Geometry</p>
                <p className="text-gray-900 text-sm">
                  {questionBank.filter(q => q.topic === 'geometry').length} questions
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-orange-600 mb-1 text-sm">Statistics</p>
                <p className="text-gray-900 text-sm">
                  {questionBank.filter(q => q.topic === 'statistics').length} questions
                </p>
              </div>
            </div>

            {/* Question List - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">ID</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Topic</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Difficulty</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Question</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Points</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionBank.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage).map((question) => (
                    <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 text-sm">{question.id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                          {question.topic}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm max-w-md truncate">
                        {question.question}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{question.points}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingQuestion(question)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'question', id: question.id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Question List - Mobile */}
            <div className="md:hidden space-y-3">
              {questionBank.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage).map((question) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                          {question.topic}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm mb-1">{question.question}</p>
                      <p className="text-gray-600 text-xs">ID: {question.id} • {question.points} points</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="flex-1 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'question', id: question.id })}
                      className="flex-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {questionBank.length > questionsPerPage && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  Showing {questionsPerPage} of {questionBank.length} questions
                </p>
                <div className="flex items-center justify-center mt-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="mx-3 text-gray-600">
                    Page {currentPage} of {Math.ceil(questionBank.length / questionsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(questionBank.length / questionsPerPage)))}
                    className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={currentPage === Math.ceil(questionBank.length / questionsPerPage)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-900 mb-1">Rewards</h2>
                <p className="text-gray-600">Total Rewards: {rewards.length}</p>
              </div>
              <button
                onClick={() => setShowAddReward(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Reward
              </button>
            </div>

            {/* Reward List - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">ID</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Name</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Description</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Icon</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Points Required</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Category</th>
                    <th className="px-4 py-3 text-left text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.slice(0, 10).map((reward) => (
                    <tr key={reward.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 text-sm">{reward.id}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{reward.name}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm max-w-md truncate">
                        {reward.description}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{reward.icon}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{reward.pointsRequired}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{reward.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingReward(reward);
                              setRewardForm({
                                name: reward.name,
                                description: reward.description,
                                icon: reward.icon,
                                pointsRequired: reward.pointsRequired,
                                category: reward.category,
                              });
                              setShowAddReward(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'reward', id: reward.id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Reward List - Mobile */}
            <div className="md:hidden space-y-3">
              {rewards.slice(0, 10).map((reward) => (
                <div key={reward.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                          {reward.category}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm mb-1">{reward.name}</p>
                      <p className="text-gray-600 text-xs">ID: {reward.id} • {reward.pointsRequired} points</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingReward(reward);
                        setRewardForm({
                          name: reward.name,
                          description: reward.description,
                          icon: reward.icon,
                          pointsRequired: reward.pointsRequired,
                          category: reward.category,
                        });
                        setShowAddReward(true);
                      }}
                      className="flex-1 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'reward', id: reward.id })}
                      className="flex-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {rewards.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  Showing 10 of {rewards.length} rewards
                </p>
              </div>
            )}
          </div>
        )}

        {/* System Report Tab */}
        {activeTab === 'report' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 mb-6">System Report</h2>
            
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Questions</span>
                    <span className="text-gray-900">{questionBank.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Users</span>
                    <span className="text-gray-900">{users.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Active Students</span>
                    <span className="text-gray-900">{users.filter(u => u.role === 'student').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Quizzes Taken</span>
                    <span className="text-gray-900">{Object.values(progress).reduce((sum, p) => sum + p.quizzesTaken, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Points</span>
                    <span className="text-gray-900">{Object.values(progress).reduce((sum, p) => sum + p.totalPoints, 0)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Averages</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Quizzes Per User</span>
                    <span className="text-gray-900">
                      {users.filter(u => u.role === 'student').length > 0
                        ? (Object.values(progress).reduce((sum, p) => sum + p.quizzesTaken, 0) / users.filter(u => u.role === 'student').length).toFixed(1)
                        : 0
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Points Per User</span>
                    <span className="text-gray-900">
                      {users.filter(u => u.role === 'student').length > 0
                        ? (Object.values(progress).reduce((sum, p) => sum + p.totalPoints, 0) / users.filter(u => u.role === 'student').length).toFixed(0)
                        : 0
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Questions by Topic</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Arithmetic</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.topic === 'arithmetic').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Algebra</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.topic === 'algebra').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Geometry</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.topic === 'geometry').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Statistics</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.topic === 'statistics').length}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Questions by Difficulty</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Easy</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.difficulty === 'easy').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Medium</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.difficulty === 'medium').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Hard</span>
                    <span className="text-gray-900">{questionBank.filter(q => q.difficulty === 'hard').length}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">Top Users</h3>
                <div className="space-y-3">
                  {users
                    .filter(u => u.role === 'student')
                    .map(u => ({
                      username: u.username,
                      level: u.level,
                      points: progress[u.id]?.totalPoints || 0,
                      quizzes: progress[u.id]?.quizzesTaken || 0,
                    }))
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{user.username}</span>
                        <span className="text-gray-900">{user.points} points</span>
                      </div>
                    ))}
                </div>
              </div>

              <button
                onClick={generateSystemReport}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
                <button
                  onClick={() => {
                    setShowAddQuestion(false);
                    setEditingQuestion(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                {/* Topic & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Topic</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => handleFormChange('topic', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="arithmetic">Arithmetic</option>
                      <option value="algebra">Algebra</option>
                      <option value="geometry">Geometry</option>
                      <option value="statistics">Statistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleFormChange('difficulty', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-gray-700 mb-2">Question</label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => {
                      handleFormChange('question', e.target.value);
                      setQuestionErrors(prev => ({ ...prev, question: false }));
                    }}
                    placeholder="Enter the question..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      questionErrors.question ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {questionErrors.question && <p className="text-red-500 text-sm mt-1">Please enter a question</p>}
                </div>

                {/* Options */}
                <div>
                  <label className="block text-gray-700 mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === index}
                            onChange={() => handleFormChange('correctAnswer', index)}
                            className="w-4 h-4 text-purple-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              handleOptionChange(index, e.target.value);
                              const newErrors = [...questionErrors.options];
                              newErrors[index] = false;
                              setQuestionErrors(prev => ({ ...prev, options: newErrors }));
                            }}
                            placeholder={`Option ${index + 1}`}
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              questionErrors.options[index] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {questionErrors.options[index] && <p className="text-red-500 text-sm ml-6">Please fill this option</p>}
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Select the correct answer using the radio button</p>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-gray-700 mb-2">Explanation</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => {
                      handleFormChange('explanation', e.target.value);
                      setQuestionErrors(prev => ({ ...prev, explanation: false }));
                    }}
                    placeholder="Explain the answer..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      questionErrors.explanation ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {questionErrors.explanation && <p className="text-red-500 text-sm mt-1">Please enter an explanation</p>}
                </div>

                {/* Points */}
                <div>
                  <label className="block text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleFormChange('points', parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddQuestion(false);
                      setEditingQuestion(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Reward Modal */}
        {showAddReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">{editingReward ? 'Edit Reward' : 'Add New Reward'}</h2>
                <button
                  onClick={() => {
                    setShowAddReward(false);
                    setEditingReward(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!rewardForm.name.trim() || !rewardForm.description.trim()) {
                  setRewardErrors({
                    name: !rewardForm.name.trim(),
                    description: !rewardForm.description.trim(),
                  });
                  toast.error('Please fill all fields');
                  return;
                }
                
                if (editingReward) {
                  setRewards(prev => prev.map(r => r.id === editingReward.id ? {...editingReward, ...rewardForm} : r));
                  toast.success('Reward updated successfully!');
                } else {
                  setRewards(prev => [...prev, {id: Date.now().toString(), ...rewardForm}]);
                  toast.success('Reward added successfully!');
                }
                
                setShowAddReward(false);
                setEditingReward(null);
                setRewardForm({
                  name: '',
                  description: '',
                  icon: '🏆',
                  pointsRequired: 100,
                  category: 'achievement',
                });
              }} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    value={rewardForm.name}
                    onChange={(e) => {
                      setRewardForm(prev => ({ ...prev, name: e.target.value }));
                      setRewardErrors(prev => ({ ...prev, name: false }));
                    }}
                    placeholder="Enter the reward name..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      rewardErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {rewardErrors.name && <p className="text-red-500 text-sm mt-1">Please enter a name</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={rewardForm.description}
                    onChange={(e) => {
                      setRewardForm(prev => ({ ...prev, description: e.target.value }));
                      setRewardErrors(prev => ({ ...prev, description: false }));
                    }}
                    placeholder="Enter the reward description..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      rewardErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {rewardErrors.description && <p className="text-red-500 text-sm mt-1">Please enter a description</p>}
                </div>

                {/* Icon & Points Required */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Icon (Emoji)</label>
                    <input
                      value={rewardForm.icon}
                      onChange={(e) => setRewardForm(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🏆"
                      maxLength={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Points Required</label>
                    <input
                      type="number"
                      value={rewardForm.pointsRequired}
                      onChange={(e) => setRewardForm(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) }))}
                      min="1"
                      max="10000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    value={rewardForm.category}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, category: e.target.value as 'achievement' | 'milestone' | 'special' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="achievement">Achievement</option>
                    <option value="milestone">Milestone</option>
                    <option value="special">Special</option>
                  </select>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReward(false);
                      setEditingReward(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {editingReward ? 'Update Reward' : 'Add Reward'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Confirm Delete</h2>
                <p className="text-gray-600">
                  {deleteConfirm.type === 'question' 
                    ? 'Are you sure you want to delete this question? This action cannot be undone.'
                    : 'Are you sure you want to delete this reward? This action cannot be undone.'
                  }
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'reward') {
                      setRewards(prev => prev.filter(r => r.id !== deleteConfirm.id));
                      toast.success('Reward deleted successfully');
                    } else {
                      deleteQuestion(deleteConfirm.id);
                      toast.success('Question deleted successfully');
                    }
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}