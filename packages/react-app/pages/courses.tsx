import React from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  DollarSign,
  Building2,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Blockchain Development Fundamentals',
    description: 'Learn the basics of blockchain technology, smart contracts, and decentralized applications.',
    instructor: 'Dr. Sarah Johnson',
    institution: 'Tech University',
    duration: '8 weeks',
    students: 150,
    rating: 4.8,
    price: '0.1 ETH',
    category: 'Technology',
    level: 'Beginner',
    image: '/api/placeholder/300/200'
  },
  {
    id: 2,
    title: 'Advanced Smart Contract Development',
    description: 'Master advanced Solidity patterns, security best practices, and gas optimization.',
    instructor: 'Prof. Michael Chen',
    institution: 'Engineering College',
    duration: '12 weeks',
    students: 89,
    rating: 4.9,
    price: '0.2 ETH',
    category: 'Technology',
    level: 'Advanced',
    image: '/api/placeholder/300/200'
  },
  {
    id: 3,
    title: 'Web3 Frontend Development',
    description: 'Build modern web3 applications using React, ethers.js, and MetaMask integration.',
    instructor: 'Alex Rodriguez',
    institution: 'Digital Academy',
    duration: '10 weeks',
    students: 234,
    rating: 4.7,
    price: '0.15 ETH',
    category: 'Development',
    level: 'Intermediate',
    image: '/api/placeholder/300/200'
  },
  {
    id: 4,
    title: 'DeFi Protocol Design',
    description: 'Design and implement decentralized finance protocols with security and efficiency.',
    instructor: 'Dr. Emily Wang',
    institution: 'Finance Institute',
    duration: '14 weeks',
    students: 67,
    rating: 4.9,
    price: '0.25 ETH',
    category: 'Finance',
    level: 'Advanced',
    image: '/api/placeholder/300/200'
  }
];

const categories = ['All', 'Technology', 'Development', 'Finance', 'Business'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [selectedLevel, setSelectedLevel] = React.useState('All');

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'All' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'All' || course.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <>
      <Head>
        <title>Courses - EduCert</title>
        <meta name="description" content="Browse and enroll in blockchain courses" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Discover blockchain and web3 courses from leading institutions. 
                Earn verifiable certificates upon completion.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Category:</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Level:</label>
                <select 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div className="ml-auto text-sm text-gray-600">
                {filteredCourses.length} courses found
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg mb-4 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary-600" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {course.category}
                      </Badge>
                      <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'destructive'} className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-2">
                      {course.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{course.institution}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                        <span className="text-lg font-bold text-primary-600">{course.price}</span>
                      </div>
                      
                      <Button className="w-full" size="sm">
                        Enroll Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your filters to find more courses.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of students learning blockchain technology and earn verifiable certificates.
            </p>
            <Button size="lg" className="text-lg px-8 py-3">
              Browse All Courses
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
} 