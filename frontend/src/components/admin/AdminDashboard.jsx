import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  FolderDown, 
  Layers, 
  CheckCircle, 
  Clock, 
  Search, 
  LogOut, 
  X, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export default function AdminDashboard({ onSwitchToStore }) {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'categories', 'orders'
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de cursos
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal de curso
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    price: '',
    discountPrice: '',
    category: '',
    driveUrl: '',
    isFeatured: false,
    isActive: true,
    syllabus: [{ title: 'Módulo 1: Introducción y Fundamentos', description: 'Conceptos clave y configuración del entorno.' }]
  });

  // Modal de nueva categoría
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'GraduationCap',
    order: 0
  });

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, coursesRes, categoriesRes, ordersRes] = await Promise.all([
        api.get('/orders/admin/metrics'),
        api.get('/courses/admin/all'),
        api.get('/categories'),
        api.get('/orders/admin/all')
      ]);

      if (metricsRes.data?.success) setMetrics(metricsRes.data.data);
      if (coursesRes.data?.success) setCourses(coursesRes.data.data);
      if (categoriesRes.data?.success) setCategories(categoriesRes.data.data);
      if (ordersRes.data?.success) setOrders(ordersRes.data.data);
    } catch (err) {
      console.error('Error cargando datos del admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Abrir modal de curso
  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title || '',
        slug: course.slug || '',
        description: course.description || '',
        imageUrl: course.imageUrl || '',
        price: course.price || '',
        discountPrice: course.discountPrice || '',
        category: course.category?._id || course.category || '',
        driveUrl: course.driveUrl || '',
        isFeatured: course.isFeatured || false,
        isActive: course.isActive !== undefined ? course.isActive : true,
        syllabus: course.syllabus?.length > 0 
          ? course.syllabus.map(s => ({ title: s.title || '', description: s.description || '' }))
          : [{ title: 'Módulo 1: Introducción', description: '' }]
      });
    } else {
      setEditingCourse(null);
      const defaultCat = categories[0]?._id || '';
      setCourseForm({
        title: '',
        slug: '',
        description: '',
        imageUrl: '',
        price: '',
        discountPrice: '',
        category: defaultCat,
        driveUrl: '',
        isFeatured: false,
        isActive: true,
        syllabus: [{ title: 'Módulo 1: Introducción y Fundamentos', description: 'Conceptos clave y configuración del entorno.' }]
      });
    }
    setIsCourseModalOpen(true);
  };

  // Manejadores del temario
  const handleAddSyllabusItem = () => {
    setCourseForm(prev => ({
      ...prev,
      syllabus: [
        ...prev.syllabus,
        { title: `Módulo ${prev.syllabus.length + 1}: `, description: '' }
      ]
    }));
  };

  const handleRemoveSyllabusItem = (index) => {
    setCourseForm(prev => {
      const filtered = prev.syllabus.filter((_, i) => i !== index);
      return {
        ...prev,
        syllabus: filtered.length > 0 ? filtered : [{ title: '', description: '' }]
      };
    });
  };

  const handleSyllabusChange = (index, field, value) => {
    setCourseForm(prev => {
      const updated = [...prev.syllabus];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, syllabus: updated };
    });
  };

  // Alternar rápidamente estado activo/inactivo desde la tabla
  const handleToggleCourseStatus = async (course) => {
    try {
      await api.put(`/courses/${course._id}`, {
        isActive: !course.isActive
      });
      loadDashboardData();
    } catch (err) {
      alert('Error cambiando estado del curso: ' + err.message);
    }
  };

  // Guardar curso
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...courseForm,
        price: Number(courseForm.price),
        discountPrice: courseForm.discountPrice ? Number(courseForm.discountPrice) : null,
        isActive: Boolean(courseForm.isActive),
        isFeatured: Boolean(courseForm.isFeatured),
        syllabus: courseForm.syllabus.filter(s => s.title.trim())
      };

      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, payload);
      } else {
        await api.post('/courses', payload);
      }

      setIsCourseModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error guardando curso');
    }
  };

  // Eliminar curso
  const handleDeleteCourse = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este curso de la base de datos?')) {
      try {
        await api.delete(`/courses/${id}`);
        loadDashboardData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Guardar categoría
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', {
        ...categoryForm,
        order: Number(categoryForm.order) || 0
      });
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', slug: '', description: '', icon: 'GraduationCap', order: 0 });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error creando categoría');
    }
  };

  // Filtrado de cursos en tabla
  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchCat = selectedCategoryFilter === 'all' || c.category?.slug === selectedCategoryFilter || c.category?._id === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#070A11] text-gray-100 flex flex-col font-sans">
      
      {/* Barra Superior del Administrador */}
      <header className="sticky top-0 z-30 bg-[#0B0F19]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <span className="text-sm sm:text-lg font-black tracking-wider text-white">OMNITRON ACADEMY</span>
              <span className="hidden sm:block text-[10px] font-bold tracking-widest uppercase text-amber-400">
                Panel de Administración de Cursos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Botón Ver Tienda */}
            <button
              onClick={onSwitchToStore}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Ver Tienda</span>
              <span className="xs:hidden">Tienda</span>
            </button>

            <button
              onClick={loadDashboardData}
              className="p-1.5 sm:p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition"
              title="Refrescar datos"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={logout}
              className="p-1.5 sm:p-2 rounded-xl bg-gray-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-800 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 space-y-8">
        
        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Recaudado</span>
              <span className="text-2xl font-black text-white">
                ${metrics?.totalRevenue?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Órdenes Pagadas</span>
              <span className="text-2xl font-black text-white">
                {metrics?.paidOrders || 0}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Cursos en Catálogo</span>
              <span className="text-2xl font-black text-white">
                {courses.length}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Alumnos Registrados</span>
              <span className="text-2xl font-black text-white">
                {metrics?.totalCustomers || 0}
              </span>
            </div>
          </div>

        </div>

        {/* Pestañas de Navegación con scroll horizontal en móviles */}
        <div className="flex border-b border-gray-800 gap-2 sm:gap-4 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Cursos ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'categories'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ventas & Órdenes ({orders.length})</span>
          </button>
        </div>

        {/* PESTAÑA 1: GESTOR DE CURSOS */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            
            {/* Filtros y Botón Crear Curso */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar curso..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full bg-gray-900 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-gray-900 text-xs text-white px-3 py-2.5 rounded-xl border border-gray-800 focus:outline-none"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleOpenCourseModal(null)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Curso</span>
              </button>

            </div>

            {/* Tabla de Cursos */}
            <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/80 text-gray-400 border-b border-gray-800 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Curso</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio & Descuento</th>
                    <th className="py-3 px-4">Google Drive</th>
                    <th className="py-3 px-4">Temario</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {filteredCourses.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={c.imageUrl}
                          alt={c.title}
                          className="w-12 h-10 object-cover rounded-lg bg-gray-800 shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-white block truncate">{c.title}</span>
                          <span className="text-[11px] text-gray-400">{c.slug}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-200 block">{c.category?.name || 'General'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">
                          ${(c.discountPrice || c.price).toFixed(2)}
                        </span>
                        {c.discountPrice && (
                          <span className="text-[11px] text-gray-500 line-through">
                            ${c.price.toFixed(2)} (-{c.discountPercentage}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {c.driveUrl ? (
                          <a
                            href={c.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
                          >
                            <FolderDown className="w-3.5 h-3.5" />
                            <span>Carpeta Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-red-400">Sin link</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-800 font-semibold text-[11px]">
                          {c.syllabus?.length || 0} módulos
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleCourseStatus(c)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                            c.isActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 shadow-sm shadow-red-500/10'
                          }`}
                          title={c.isActive ? 'Clic para poner Inactivo (ocultar de la tienda)' : 'Clic para poner Activo (mostrar en la tienda)'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          <span>{c.isActive ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenCourseModal(c)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c._id)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* PESTAÑA 2: CATEGORÍAS DE CURSOS */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Categorías de Cursos</h3>
                <p className="text-xs text-gray-400">Áreas temáticas y especialidades en las que se clasifican los cursos</p>
              </div>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat._id} className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{cat.name}</h4>
                      <span className="text-[11px] text-gray-400">slug: /{cat.slug}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {cat.courseCount || 0} cursos
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {cat.description || 'Sin descripción'}
                  </p>

                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Ícono: {cat.icon || 'GraduationCap'}</span>
                    <span>Orden: {cat.order || 0}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* PESTAÑA 3: VENTAS Y ÓRDENES */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Registro de Ventas en Vivo</h3>
                <p className="text-xs text-gray-400">Historial de compras de cursos y acceso a Google Drive</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950/80 text-gray-400 border-b border-gray-800 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Cursos Adquiridos</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Método de Pago</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-300">
                        #{o._id.slice(-6)}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {o.userEmail}
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                        {o.items?.map(i => i.title).join(', ')}
                      </td>
                      <td className="py-3 px-4 font-black text-white">
                        ${o.totalAmount?.toFixed(2)} USD
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-300 font-semibold text-[11px]">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {o.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* MODAL CREAR / EDITAR CURSO */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto">
            
            <button
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-6">
              {editingCourse ? 'Editar Curso' : 'Publicar Nuevo Curso'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Título del Curso</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCourseForm(prev => ({
                        ...prev,
                        title,
                        slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      }));
                    }}
                    placeholder="Ej. Máster en Python..."
                    className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Slug identificador (URL)</label>
                  <input
                    type="text"
                    required
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                    className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Categoría del Curso</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  required
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                >
                  <option value="">Selecciona una categoría...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">URL de Imagen de Portada</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={courseForm.imageUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, imageUrl: e.target.value })}
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Precio Regular ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Precio con Descuento ($ USD opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.discountPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, discountPrice: e.target.value })}
                    className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* ENLACE DE GOOGLE DRIVE (PROTEGIDO) */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <label className="block text-blue-300 font-bold mb-1 flex items-center gap-1.5">
                  <FolderDown className="w-4 h-4 text-blue-400" />
                  <span>Enlace de Google Drive (Protegido - Solo para Alumnos con Pago Confirmado)</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={courseForm.driveUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, driveUrl: e.target.value })}
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-blue-500/30 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  El servidor protege este enlace en la base de datos y nunca lo expone públicamente.
                </span>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Descripción del Curso</label>
                <textarea
                  rows={2}
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                />
              </div>

              {/* SECCIÓN DEL TEMARIO DEL CURSO */}
              <div className="pt-3 border-t border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-gray-200 font-bold text-xs">
                      📚 Temario / Módulos del Curso
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Estructura los módulos y lecciones que los alumnos cursarán
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSyllabusItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Módulo</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {courseForm.syllabus.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-gray-950/70 border border-gray-800/80 space-y-2 relative group hover:border-gray-700 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            required
                            placeholder={`Título del módulo (ej. Módulo ${index + 1}: Fundamentos...)`}
                            value={item.title}
                            onChange={(e) => handleSyllabusChange(index, 'title', e.target.value)}
                            className="w-full bg-gray-900 text-white px-2.5 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-blue-500 text-xs font-semibold"
                          />
                        </div>

                        {courseForm.syllabus.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSyllabusItem(index)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition shrink-0"
                            title="Eliminar este módulo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Descripción de los temas aprendidos en este módulo..."
                        value={item.description}
                        onChange={(e) => handleSyllabusChange(index, 'description', e.target.value)}
                        className="w-full bg-gray-900 text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-800 focus:outline-none focus:border-gray-700 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTADO DEL CURSO (ACTIVO / INACTIVO) & DESTACADO */}
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-gray-200 font-bold text-xs">
                      Estado de Publicación:
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {courseForm.isActive 
                        ? '🟢 Activo: Visible en la tienda para los alumnos' 
                        : '🔴 Inactivo: Oculto de la tienda (no se mostrará a los alumnos)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCourseForm({ ...courseForm, isActive: true })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        courseForm.isActive 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50' 
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Activo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseForm({ ...courseForm, isActive: false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        !courseForm.isActive 
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-500/50' 
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      Inactivo
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-gray-200 font-bold text-xs block">
                      Curso Destacado:
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Muestra la insignia "Destacado" en la portada del curso
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={courseForm.isFeatured}
                    onChange={(e) => setCourseForm({ ...courseForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-gray-900 border-gray-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                >
                  Guardar Curso
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA CATEGORÍA */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-6">Nueva Categoría de Cursos</h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Robótica & Hardware"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    }));
                  }}
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Slug</label>
                <input
                  type="text"
                  required
                  placeholder="ej. robotica-hardware"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Descripción de la categoría..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Ícono</label>
                  <select
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                  >
                    <option value="GraduationCap">GraduationCap</option>
                    <option value="Code">Code</option>
                    <option value="Wrench">Wrench</option>
                    <option value="Palette">Palette</option>
                    <option value="Cpu">Cpu</option>
                    <option value="Shield">Shield</option>
                    <option value="TrendingUp">TrendingUp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Orden</label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                    className="w-full bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
