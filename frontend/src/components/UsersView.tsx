import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

const roleOptions = [
  { value: 'PM', label: 'PM' },
  { value: 'PMO', label: 'PMO' },
  { value: 'Sponsor', label: 'Sponsor' },
  { value: 'Team_Member', label: 'Team Member' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Stakeholder', label: 'Stakeholder' }
];

const displayRole = (r: string) => {
  return r === 'Team_Member' ? 'Team Member' : r;
};

const UsersView = ({ currentUser }: { currentUser: User }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Team_Member', department: '', phone: '', position: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUsers();
        if (mounted) setUsers(data);
      } catch (err) {
        // fallback to mock data if API not available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { mockUsers } = require('../mockData');
        if (mounted) setUsers(mockUsers);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar usuario?')) return;
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('No se pudo eliminar usuario.');
    }
  };

  const handleCreateToggle = () => setShowForm(v => !v);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert('Nombre, email y contraseña son requeridos');
      return;
    }
    try {
      if (editingId) {
        // Update existing
        const payload: any = { ...form };
        // Do not send empty password for updates
        if (!payload.password) delete payload.password;
        const updated = await apiService.updateUser(editingId, payload);
        setUsers(prev => prev.map(u => (u.id === editingId ? updated : u)));
        setEditingId(null);
      } else {
        const payload: any = { ...form };
        const created = await apiService.createUser(payload);
        setUsers(prev => [created, ...prev]);
      }

      setForm({ name: '', email: '', password: '', role: 'Team_Member', department: '', phone: '', position: '' });
      setShowForm(false);
    } catch (err: any) {
      alert(err?.message || 'No se pudo guardar el usuario');
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setForm({ name: u.name || '', email: u.email || '', password: '', role: u.role || 'Team_Member', department: u.department || '', phone: u.phone || '', position: u.position || '' });
    setShowForm(true);
  };

  return (
    <div className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Usuarios</h1>
          <p className="text-muted">Listado de usuarios registrados en el sistema.</p>
        </div>
        {currentUser.role === 'Admin' && (
          <div>
            <button className="btn btn-primary" onClick={handleCreateToggle}>{showForm ? 'Cancelar' : 'Crear usuario'}</button>
          </div>
        )}
      </header>

      {showForm && (
        <form className="card form-container" onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rol</label>
              <select name="role" value={form.role} onChange={handleChange}>
                {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Departamento</label>
              <input name="department" value={form.department} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Posición</label>
              <input name="position" value={form.position} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit">Guardar</button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Departamento</th>
                <th>Posición</th>
                {currentUser.role === 'Admin' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{displayRole(u.role)}</td>
                  <td>{u.department || ''}</td>
                  <td>{u.position || ''}</td>
                  {currentUser.role === 'Admin' && (
                    <td style={{ width: '180px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-xs" onClick={() => handleEdit(u)}>Editar</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(u.id)}>Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersView;
