import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPatientById } from '../lib/storage';
import { numberToWordsRupees } from '../lib/numberToWords';
import { format } from 'date-fns';
import logo from '../assets/logo.png';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patient, setPatient] = useState(null);
  
  const includeHistory = searchParams.get('includeHistory') === 'true';
  
  useEffect(() => {
    async function load() {
      const data = await getPatientById(id);
      setPatient(data);
    }
    load();
  }, [id]);

  if (!patient) return <div className="p-8">Loading Invoice...</div>;

  let totalAmount = 0;
  let dateRange = format(new Date(patient.startDate || new Date()), 'dd/MM/yyyy');

  if (patient.packageDays === 'daily') {
    totalAmount = patient.sessions ? patient.sessions.reduce((sum, s) => sum + Number(s.amountPaid || 0), 0) : 0;
    if (patient.sessions && patient.sessions.length > 0) {
      const dates = patient.sessions.map(s => new Date(s.date).getTime()).sort();
      const firstDate = format(new Date(dates[0]), 'dd/MM/yyyy');
      const lastDate = format(new Date(dates[dates.length - 1]), 'dd/MM/yyyy');
      dateRange = dates.length === 1 ? firstDate : `${firstDate} - ${lastDate}`;
    }
  } else {
    totalAmount = Number(patient.paymentAmount || 0);
  }

  return (
    <div className="invoice-container">
      {/* Non-printable back button */}
      <div className="no-print" style={{ padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
        <button className="btn btn-outline mr-4" style={{ marginRight: '1rem' }} onClick={() => navigate(-1)}>Back to Profile</button>
        <button className="btn btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="invoice-page relative" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', color: '#1e3a5f', padding: '40px 50px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', minHeight: '1122px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <img src={logo} alt="Gyromotion Logo" style={{ height: '70px', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.9rem', fontStyle: 'italic', color: '#1e3a5f' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Dr. Prajakta Joshi</div>
            <div>Consultant Physiotherapist</div>
            <div>MPT-Neuro, COMT, CTE, CDRS</div>
            <div>Reg. No. 2023/12/PT/012154</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic', color: '#334155', marginBottom: '25px' }}>
          www.gyromotionphysio.in | +91 9518554022 | gyromotion.physio@gmail.com
        </div>

        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.15rem', marginBottom: '30px', position: 'relative' }}>
          PHYSIOTHERAPY TREATMENT BILL CUM RECIEPT
          <span style={{ position: 'absolute', right: 0, top: '5px', fontSize: '0.7rem' }}>No.{patient.regNo ? patient.regNo.slice(-3) : '001'}</span>
        </div>

        <div style={{ marginBottom: '25px', fontSize: '1.05rem', lineHeight: '1.6' }}>
          <div><strong style={{ color: '#0f172a' }}>Name:</strong> {patient.name}</div>
          <div><strong style={{ color: '#0f172a' }}>Patient Reg. No.:</strong> {patient.regNo || 'GPC/000000'}</div>
          <div><strong style={{ color: '#0f172a' }}>Date:</strong> {dateRange}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', backgroundColor: '#eff6ff', width: '60px', color: '#1e3a8a' }}>Sr.No.</th>
              <th style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>Date</th>
              <th style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>Service provided</th>
              <th style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>Per Session<br/>Charges(Rupees)</th>
              <th style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>No. of Sessions</th>
              <th style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {patient.packageDays === 'daily' && patient.sessions ? (
              patient.sessions.map((session, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>{index + 1}</span>
                  </td>
                  <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>
                    <span style={{ backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.9rem' }}>{format(new Date(session.date), 'dd/MM/yyyy')}</span>
                  </td>
                  <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>{session.protocol || patient.diagnosis || 'Consultation & Treatment'}</td>
                  <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>{session.amountPaid}/-</td>
                  <td style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>{session.amountPaid}/-</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'center' }}>
                  <span style={{ backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>1</span>
                </td>
                <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>
                  <span style={{ backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.9rem' }}>{format(new Date(patient.startDate || new Date()), 'dd/MM/yyyy')}</span>
                </td>
                <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>{patient.diagnosis || 'Package Payment'}</td>
                <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>
                  {patient.paymentAmount ? (patient.paymentAmount / parseInt(patient.packageDays)).toFixed(0) : 0}/-
                </td>
                <td style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'center' }}>{patient.packageDays}</td>
                <td style={{ border: '1px solid #93c5fd', padding: '12px' }}>{patient.paymentAmount}/-</td>
              </tr>
            )}
            <tr>
              <td colSpan="4" style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Total</td>
              <td style={{ border: '1px solid #93c5fd', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                {patient.packageDays === 'daily' ? (patient.sessions ? patient.sessions.length : 0) : patient.packageDays}
              </td>
              <td style={{ border: '1px solid #93c5fd', padding: '12px', fontWeight: 'bold' }}>{totalAmount}/-</td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #93c5fd', padding: '15px', marginBottom: '40px', fontSize: '1rem', backgroundColor: '#eff6ff' }}>
          <strong style={{ color: '#0f172a' }}>Total Amount in Words:</strong> {numberToWordsRupees(totalAmount)}
        </div>

        {includeHistory && patient.sessions && patient.sessions.length > 0 && (
          <div style={{ pageBreakInside: 'avoid', position: 'relative', zIndex: 10 }}>
            <h4 style={{ color: '#1e3a8a', borderBottom: '2px solid #93c5fd', paddingBottom: '5px', marginBottom: '15px' }}>Attendance History</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', textAlign: 'left', backgroundColor: '#eff6ff', width: '120px', color: '#1e3a8a' }}>Date</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', textAlign: 'left', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>Protocol Recorded</th>
                </tr>
              </thead>
              <tbody>
                {patient.sessions.map((session, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #93c5fd', padding: '8px' }}>{format(new Date(session.date), 'dd/MM/yyyy')}</td>
                    <td style={{ border: '1px solid #93c5fd', padding: '8px', color: '#1e3a8a', fontWeight: '500' }}>
                      {session.protocol || patient.diagnosis || 'Consultation & Treatment'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Spacer for stamps and signatures */}
        <div style={{ flexGrow: 1, minHeight: '150px' }}></div>

        <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '0.95rem', color: '#1e3a8a', position: 'relative', zIndex: 10, paddingBottom: '10px' }}>
          Plot no. 01, Shree Siddhiviinayak Society, Nr. Pawar Hospital, Vatan Nagar,<br/>
          Talegaon Dabhade, Pune- 410507
        </div>

        {/* Swoosh Design */}
        <svg style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 0, width: '300px', height: '300px', pointerEvents: 'none' }} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M400,400 L400,200 C300,250 150,300 0,400 Z" fill="#93c5fd" opacity="0.3" />
          <path d="M400,400 L400,250 C250,280 100,350 0,400 Z" fill="#1e3a8a" opacity="0.9" />
        </svg>

      </div>
    </div>
  );
}
