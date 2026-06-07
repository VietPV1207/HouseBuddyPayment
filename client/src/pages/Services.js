import React, { useState, useEffect } from 'react';
import { getWorkers, getServices, updateWorker } from '../api';

function Services() {
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [worker, setWorker] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, servicesRes] = await Promise.all([getWorkers(), getServices()]);
        setWorkers(workersRes.data);
        setServices(servicesRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedWorkerId) return;
    const w = workers.find(x => x._id === selectedWorkerId);
    setWorker(w || null);
    setSkills(w?.skills ? w.skills.map(s => typeof s === 'object' ? s._id : s) : []);
  }, [selectedWorkerId, workers]);

  const addSkill = () => {
    if (!selectedServiceId) return;
    if (skills.includes(selectedServiceId)) return;
    setSkills([...skills, selectedServiceId]);
    setSelectedServiceId('');
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const save = async () => {
    try {
      await updateWorker(selectedWorkerId, { skills });
      setMessage('Saved');
    } catch (e) {
      setMessage('Save failed');
    }
  };

  const getServiceName = (id) => {
    const service = services.find(s => s._id === id);
    return service ? service.service_name : id;
  };

  return (
    <div className="services">
      <h2>Manage Services (Skills)</h2>
      <label>Select Worker</label>
      <select value={selectedWorkerId} onChange={e => setSelectedWorkerId(e.target.value)}>
        <option value="">-- choose worker --</option>
        {workers.map(w => <option key={w._id} value={w._id}>{w.full_name}</option>)}
      </select>
      {worker && (
        <div className="skills">
          <h4>{worker.full_name}'s services</h4>
          <div className="skill-list">
            {skills.map((s, i) => (
              <span key={i} className="skill-tag">{getServiceName(s)} <button onClick={() => removeSkill(i)}>x</button></span>
            ))}
          </div>
          <div className="add-skill">
            <select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
              <option value="">-- choose service --</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.service_name}</option>)}
            </select>
            <button onClick={addSkill}>Add</button>
          </div>
          <button className="save-btn" onClick={save}>Save</button>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
}

export default Services;
