"use client";
import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Clock, Users, CheckCircle, Filter,
  Leaf, Zap, Sparkles, Plus, X, Link as LinkIcon
} from 'lucide-react';
import Header from '../components/Header';
import { createClient } from '@/utils/supabase/client';

const Events = ({ userType }) => {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [selectedPillars, setSelectedPillars] = useState(['all']);
  const [viewMode, setViewMode] = useState('upcoming');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  
  // Estados para Base de Datos
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Crear Evento
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', date: '', time: '', location: '', max_attendees: 100,
    pillar: 'sostenibilidad', description: '', image: '✨', link: ''
  });

  // Cargar usuario, eventos y registros guardados
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Cargar eventos desde Supabase
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        setAllEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();

    const saved = localStorage.getItem('registeredEvents');
    if (saved) {
      setRegisteredEvents(new Set(JSON.parse(saved)));
    }
  }, [supabase]);

  // Manejar creación de nuevo evento
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("Debes iniciar sesión para crear un evento.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          creator_id: currentUserId,
          title: eventForm.title,
          date: eventForm.date,
          time: eventForm.time,
          location: eventForm.location,
          attendees: Math.floor(Math.random() * 10), // Simular algunos asistentes iniciales
          max_attendees: Number(eventForm.max_attendees),
          pillar: eventForm.pillar,
          description: eventForm.description,
          image: eventForm.image,
          link: eventForm.link
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar la lista en pantalla instantáneamente
      setAllEvents(prev => [...prev, data].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowCreateModal(false);
      setEventForm({ title: '', date: '', time: '', location: '', max_attendees: 100, pillar: 'sostenibilidad', description: '', image: '✨', link: '' });
      alert("🎉 ¡Evento publicado exitosamente!");
    } catch (error) {
      console.error("Error creando evento:", error);
      alert("Hubo un error al crear el evento.");
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar registro (Abre link externo y lo guarda en My Events)
  const handleRegister = (event) => {
    // Lo guardamos localmente para que aparezca en "My Events"
    if (!registeredEvents.has(event.id)) {
      const newRegistered = new Set(registeredEvents);
      newRegistered.add(event.id);
      setRegisteredEvents(newRegistered);
      localStorage.setItem('registeredEvents', JSON.stringify([...newRegistered]));
    }
    
    // Abrir el enlace externo si existe
    if (event.link) {
      const url = event.link.startsWith('http') ? event.link : `https://${event.link}`;
      window.open(url, '_blank');
    } else {
      alert("Este evento no tiene un enlace de registro válido.");
    }
  };

  const pillars = [
    { id: 'sostenibilidad', name: 'Sostenibilidad', icon: Leaf, color: 'from-green-500 to-emerald-600' },
    { id: 'inclusion', name: 'Inclusión', icon: Users, color: 'from-orange-500 to-amber-600' },
    { id: 'innovacion', name: 'Innovación', icon: Zap, color: 'from-purple-500 to-indigo-600' },
    { id: 'moda', name: 'Moda', icon: Sparkles, color: 'from-pink-500 to-rose-600' }
  ];

  // Separar en Upcoming y Past basado en la fecha de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = allEvents.filter(e => new Date(e.date + 'T00:00:00') >= today);
  const pastEvents = allEvents.filter(e => new Date(e.date + 'T00:00:00') < today);

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

  // Formateador de fechas amigable
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
  };

  const EventCard = ({ event, isPast = false }) => {
    const pillar = pillars.find(p => p.id === event.pillar) || pillars[0];
    const percentage = isPast ? 100 : Math.min(100, (event.attendees / event.max_attendees) * 100);
    const isRegistered = registeredEvents.has(event.id);
    
    return (
      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/50 transition-all group flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
            {event.image}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                {event.title}
              </h3>
              {isRegistered && (
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 ml-2" title="Guardado en My Events" />
              )}
            </div>
            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${pillar.color} rounded-full text-white text-xs font-semibold`}>
              {pillar.name}
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Calendar size={16} className="text-cyan-400 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          {!isPast && (
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock size={16} className="text-cyan-400 flex-shrink-0" />
              <span>{event.time}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <MapPin size={16} className="text-cyan-400 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {!isPast && (
          <div className="mt-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">{event.attendees} / {event.max_attendees} Attendees</span>
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
              onClick={() => handleRegister(event)}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex justify-center items-center gap-2 ${
                isRegistered
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400 hover:bg-green-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isRegistered ? 'Ver Enlace de Evento ✓' : 'Register Now'}
              <LinkIcon size={16} />
            </button>
          </div>
        )}

        {isPast && (
          <div className="bg-gray-800 border border-cyan-500/20 rounded-xl p-3 mt-auto">
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
    <div className="flex-1 bg-black text-white flex flex-col relative">
      <Header 
        title="Discover Events"
        subtitle="Connect with the community through amazing events"
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        
        {/* Título de Filtros y Botón de Crear Evento alineados */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
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

          {/* 🚀 BOTÓN CREAR EVENTO */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 whitespace-nowrap h-fit"
          >
            <Plus size={20} /> Crear Evento
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-800 pb-4">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'upcoming'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Upcoming ({filteredUpcoming.length})
          </button>
          <button
            onClick={() => setViewMode('registered')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'registered'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            My Events ({registeredEvents.size})
          </button>
          <button
            onClick={() => setViewMode('past')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              viewMode === 'past'
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Past Events ({filteredPast.length})
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12 text-cyan-400 animate-pulse font-semibold">Cargando eventos de la comunidad...</div>
        ) : (
          <>
            {viewMode === 'upcoming' && (
              <div className="animate-fadeIn">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUpcoming.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {filteredUpcoming.length === 0 && (
                  <p className="text-gray-500 text-center py-12">No hay eventos próximos en esta categoría.</p>
                )}
              </div>
            )}

            {viewMode === 'registered' && (
              <div className="animate-fadeIn">
                {registeredEvents.size === 0 ? (
                  <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
                    <CheckCircle size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No events registered yet</p>
                    <p className="text-gray-500 text-sm mt-2">Register for events to see them here</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allEvents
                      .filter(event => registeredEvents.has(event.id))
                      .map(event => (
                        <EventCard key={event.id} event={event} isPast={new Date(event.date + 'T00:00:00') < today} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'past' && (
              <div className="animate-fadeIn">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPast.map(event => (
                    <EventCard key={event.id} event={event} isPast={true} />
                  ))}
                </div>
                {filteredPast.length === 0 && (
                  <p className="text-gray-500 text-center py-12">No hay eventos pasados en esta categoría.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 🚀 MODAL PARA CREAR EVENTO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={24} /> Crear Nuevo Evento
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Título del Evento</label>
                  <input required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. Sustainable Fashion Summit 2026" />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Fecha</label>
                  <input required type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Horario</label>
                  <input required type="text" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. 10:00 AM - 6:00 PM" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Ubicación (o plataforma)</label>
                  <input required type="text" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. Online (Zoom) o Mexico City Center" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1 font-semibold text-green-400 flex items-center gap-2"><LinkIcon size={16} /> Enlace de Registro (URL)</label>
                  <input required type="url" value={eventForm.link} onChange={e => setEventForm({...eventForm, link: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-green-500/30 rounded-xl text-white focus:outline-none focus:border-green-500" placeholder="https://zoom.us/... o https://eventbrite.com/..." />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Pilar Principal</label>
                  <select value={eventForm.pillar} onChange={e => setEventForm({...eventForm, pillar: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                    {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Cupo Máximo</label>
                  <input required type="number" min="1" value={eventForm.max_attendees} onChange={e => setEventForm({...eventForm, max_attendees: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Descripción del Evento</label>
                  <textarea required rows={3} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none" placeholder="Breve descripción de lo que pasará en el evento..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Icono / Emoji (Representativo)</label>
                  <input required type="text" maxLength="2" value={eventForm.image} onChange={e => setEventForm({...eventForm, image: e.target.value})} className="w-20 text-center text-3xl px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="✨" />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-500/20">
                {isSaving ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Guardando...</>
                ) : (
                  <><Calendar size={20} /> Publicar Evento</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;