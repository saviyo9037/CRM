import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Protectedroute from './pages/Protectedroute';
import Spinner from './components/Spinner';

// Lazy load route pages for performance & code splitting
const Auth = lazy(() => import('./pages/Auth'));
const Subadmincustomer = lazy(() => import('./pages/Subadmincustomer'));
const Subadminleads = lazy(() => import('./pages/Subadminleads'));
const Subadminfollowups = lazy(() => import('./pages/Subadminfollowups'));
const Subadminreports = lazy(() => import('./pages/Subadminreports'));
const Admindashboard = lazy(() => import('./pages/Admindashboard'));
const Admintasks = lazy(() => import('./pages/Admintasks'));
const Subadminstafflist = lazy(() => import('./pages/Subadminstafflist'));
const Subadmintask = lazy(() => import('./pages/Subadmintask'));
const Agenttask = lazy(() => import('./pages/Agenttask'));
const Settings = lazy(() => import('./pages/Settings'));
const Paymentreports = lazy(() => import('./pages/Paymentreports'));
const PaymentAddModel = lazy(() => import('./components/payments/PaymentAddModel'));
const ProductPaymentDetails = lazy(() => import('./components/payments/ProductPaymentDetails'));
const PaymentReportSide = lazy(() => import('./pages/PaymentReportSide'));
const PaymentDetails = lazy(() => import('./components/payments/PaymentDetails.jsx'));
const Stafflist = lazy(() => import('./pages/Stafflist.jsx'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Auth />} />

        {/* Protected Routes */}
        <Route path='/admindashboard' element={<Protectedroute><Admindashboard /></Protectedroute>} />
        <Route path='/subadminhome' element={<Protectedroute><Admindashboard /></Protectedroute>} />
        <Route path='/agents' element={<Protectedroute><Stafflist /></Protectedroute>} />
        <Route path='/staffs' element={<Protectedroute><Subadminstafflist /></Protectedroute>} />
        <Route path='/leads' element={<Protectedroute><Subadminleads /></Protectedroute>} />
        <Route path='/customers' element={<Protectedroute><Subadmincustomer /></Protectedroute>} />
        <Route path='/tasks' element={<Protectedroute><Admintasks /></Protectedroute>} />
        <Route path='/subadmintasks' element={<Protectedroute><Subadmintask /></Protectedroute>} />
        <Route path='/agenttasks' element={<Protectedroute><Agenttask /></Protectedroute>} />
        <Route path='/followups' element={<Protectedroute><Subadminfollowups /></Protectedroute>} />
        <Route path='/payments' element={<Protectedroute><Paymentreports /></Protectedroute>} />
        <Route path='/subadminreports' element={<Protectedroute><Subadminreports /></Protectedroute>} />
        <Route path='/settings' element={<Protectedroute><Settings /></Protectedroute>} />

        <Route path="/payment-details/:productId" element={<PaymentDetails />} />
        <Route path="/addPayment" element={<PaymentAddModel />} />
        <Route path='/paymentDetails' element={<PaymentDetails />} />
        <Route path='/productPaymentDetails' element={<ProductPaymentDetails />} />
        <Route path='/paymentReports' element={<PaymentReportSide />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Suspense>
  );
}

export default App;
