import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Clock, Users, CheckCircle, Filter,
  Leaf, Zap, Sparkles
} from 'lucide-react';
import Header from '../components/Header';

const Events = () => {
  const [selectedPillars, setSelectedPillars] = useState(['all']);
  const [viewMode, setViewMode] = useState('upcoming');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  // Load registered events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('registeredEvents');
    if (saved) {
      setRegisteredEvents(new Set(JSON.parse(saved)));
    }
  }, []);

  // Handle event registration
  const handleRegister = (eventId) => {
    const newRegistered = new Set(registeredEvents);
    
    if (newRegistered.has(eventId)) {
      newRegistered.delete(eventId);
    } else {
      newRegistered.add(eventId);
    }
    
    setRegisteredEvents(newRegistered);
    localStorage.setItem('registeredEvents', JSON.stringify([...newRegistered]));
  };

  const pillars = [
    { id: 'sostenibilidad', name: 'Sostenibilidad', icon: Leaf, color: 'from-green-500 to-emerald-600' },
    { id: 'inclusion', name: 'Inclusión', icon: Users, color: 'from-orange-500 to-amber-600' },
    { id: 'innovacion', name: 'Innovación', icon: Zap, color: 'from-purple-500 to-indigo-600' },
    { id: 'moda', name: 'Moda', icon: Sparkles, color: 'from-pink-500 to-rose-600' }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Sustainable Fashion Summit 2026',
      date: 'Feb 25, 2026',
      time: '10:00 AM - 6:00 PM',
      location: 'Mexico City Convention Center',
      attendees: 150,
      maxAttendees: 200,
      pillar: 'sostenibilidad',
      description: 'Join industry leaders discussing the future of sustainable fashion and circular economy.',
      image: '🌱',
      registered: false
    },
    {
      id: 2,
      title: 'Inclusive Design Workshop',
      date: 'Mar 5, 2026',
      time: '2:00 PM - 5:00 PM',
      location: 'Online (Zoom)',
      attendees: 85,
      maxAttendees: 100,
      pillar: 'inclusion',
      description: 'Learn how to create fashion that celebrates diversity and accessibility.',
      image: '🤝',
      registered: true
    },
    {
      id: 3,
      title: 'Fashion Tech Innovation Lab',
      date: 'Mar 12, 2026',
      time: '1:00 PM - 7:00 PM',
      location: 'Guadalajara Tech Hub',
      attendees: 92,
      maxAttendees: 150,
      pillar: 'innovacion',
      description: 'Explore cutting-edge technology transforming the fashion industry.',
      image: '⚡',
      registered: false
    },
    {
      id: 4,
      title: 'Spring Fashion Showcase',
      date: 'Mar 18, 2026',
      time: '7:00 PM - 10:00 PM',
      location: 'Fashion District CDMX',
      attendees: 180,
      maxAttendees: 250,
      pillar: 'moda',
      description: 'Discover the latest spring collections from emerging designers.',
      image: '✨',
      registered: false
    }
  ];

  const pastEvents = [
    {
      id: 5,
      title: 'Circular Economy Forum',
      date: 'Jan 15, 2026',
      time: '9:00 AM - 5:00 PM',
      location: 'Puebla Convention Center',
      attendees: 200,
      pillar: 'sostenibilidad',
      description: 'Discussing sustainable business models in fashion.',
      image: '♻️'
    },
    {
      id: 6,
      title: 'Women in Fashion Leadership',
      date: 'Jan 28, 2026',
      time: '3:00 PM - 6:00 PM',
      location: 'Monterrey Business Center',
      attendees: 120,
      pillar: 'inclusion',
      description: 'Empowering women leaders in the fashion industry.',
      image: '👩‍💼'
    }
  ];

  const togglePillar = (pillarId) => {
    if (pillarId === 'all') {
      setSelectedPillars(['all']);
    } else {
      const newSelected = selectedPillars.filter(p => p !== 'all');
      if (newSelected.includes(pillarId)) {
        const filtered = newSelected.filter(p => p !== pillarId);
        setSelectedPillars(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setSelectedPillars([...newSelected, pillarId]);
      }
    }
  };

  const filterEvents = (events) => {
    if (selectedPillars.includes('all')) return events;
    return events.filter(event => selectedPillars.includes(event.pillar));
  };

  const EventCard = ({ event, isPast = false }) => {
    const pillar = pillars.find(p => p.id === event.pillar);
    const percentage = isPast ? 100 : (event.attendees / event.maxAttendees) * 100;
    
    return (
      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/50 transition-all group">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
            {event.image}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {event.title}
              </h3>
              {event.registered && (
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 ml-2" />
              )}
            </div>
            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${pillar.color} rounded-full text-white text-xs font-semibold`}>
              {pillar.name}
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Calendar size={16} className="text-cyan-400" />
            <span>{event.date}</span>
          </div>
          {!isPast && (
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock size={16} className="text-cyan-400" />
              <span>{event.time}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <MapPin size={16} className="text-cyan-400" />
            <span>{event.location}</span>
          </div>
        </div>

        {!isPast && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">{event.attendees} / {event.maxAttendees} Attendees</span>
                <span className="text-cyan-400 font-semibold">{Math.round(percentage)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={() => handleRegister(event.id)}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                registeredEvents.has(event.id)
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
              }`}
            >
              {registeredEvents.has(event.id) ? 'Registered ✓' : 'Register Now'}
            </button>
          </>
        )}

        {isPast && (
          <div className="bg-gray-800 border border-cyan-500/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={16} />
                <span className="text-sm">{event.attendees} Attended</span>
              </div>
              <CheckCircle size={16} className="text-cyan-400" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredUpcoming = filterEvents(upcomingEvents);
  const filteredPast = filterEvents(pastEvents);

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        title="Discover Events"
        subtitle="Connect with the community through amazing events"
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        {/* Filter by Pillar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-cyan-400" />
            <h2 className="text-lg font-semibold">Filter by Pillar</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => togglePillar('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                selectedPillars.includes('all')
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              ✨ All Events
            </button>
            {pillars.map(pillar => {
              const Icon = pillar.icon;
              return (
              <button
                key={pillar.id}
                onClick={() => togglePillar(pillar.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  selectedPillars.includes(pillar.id)
                    ? `bg-gradient-to-r ${pillar.color} text-white`
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {pillar.name}
              </button>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'upcoming'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Upcoming ({filteredUpcoming.length})
          </button>
          <button
            onClick={() => setViewMode('registered')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'registered'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            My Events ({registeredEvents.size})
          </button>
          <button
            onClick={() => setViewMode('past')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'past'
                ? 'bg-gray-900 text-white border border-cyan-500/30'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Past Events ({filteredPast.length})
          </button>
        </div>

        {/* Events Grid */}
        {viewMode === 'upcoming' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredUpcoming.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'registered' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Events</h2>
            {registeredEvents.size === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
                <CheckCircle size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No events registered yet</p>
                <p className="text-gray-500 text-sm mt-2">Register for events to see them here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredUpcoming
                  .filter(event => registeredEvents.has(event.id))
                  .map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'past' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Past Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPast.map(event => (
                <EventCard key={event.id} event={event} isPast={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
