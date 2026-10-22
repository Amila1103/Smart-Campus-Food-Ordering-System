import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import UnregisterHome from "./Components/Website/Home/UnregisterHome/UnregisterHome";
import RegisterHome from "./Components/Website/Home/RegisterHome/RegisterHome";
import CustomerLogin from "./Components/Website/CustomerLogin/CustomerLogin";
import CustomerRegister from "./Components/Website/CustomerRegister/CustomerRegister";

import ProtectedRoute from "./Components/Website/ProtectedRoute/ProtectedRoute";
import UnregisterContactUs from "./Components/Website/ContactUs/UnregisterContactUs/UnregisterContactUs";
import UnregisterAboutUS from "./Components/Website/AboutUs/UnregisterAboutUS/UnregisterAboutUS";
import StaffProtectedRoute from "./Components/Website/ProtectedRoute/StaffProtectedRoute";
import Unauthorized from "./Components/Website/Unauthorized/Unauthorized";
import RegisterAboutUS from "./Components/Website/AboutUs/RegisterAboutUS/RegisterAboutUS";
import RegisterContactUs from "./Components/Website/ContactUs/RegisterContactUs/RegisterContactUs";
import StaffLogin from "./Components/Website/StaffLogin/StaffLogin";
import UnregisterMenu from "./Components/Website/CustomerMenu/UnregisterMenu/UnregisterMenu";
import RegisterMenu from "./Components/Website/CustomerMenu/RegisterMenu/RegisterMenu";
import ConfirmOrder from "./Components/Website/ConfirmOrder/ConfirmOrder";
import CartPage from "./Components/Website/CartPage/CartPage";
import PaymentPage from "./Components/Website/PaymentPage/PaymentPage";
import CustomerProfile from "./Components/Customer/CustomerProfile/CustomerProfile";
import VendorDashboard from "./Components/Staff/Vendor/VendorDashboard/VendorDashboard";
import VendorOrders from "./Components/Staff/Vendor/VendorOrders/VendorOrders";
import VendorOrderProcessing from "./Components/Staff/Vendor/VendorOrderProcessing/VendorOrderProcessing";
import VendorCompletedOrders from "./Components/Staff/Vendor/VendorCompletedOrders/VendorCompletedOrders";
import VendorEditMenuPage from "./Components/Staff/Vendor/MenuPage/VendorEditMenuPage";
import VendorAddMenuPage from "./Components/Staff/Vendor/MenuPage/VendorAddMenuPage";
import VendorAddInventory from "./Components/Staff/Vendor/VendorAddInventory/VendorAddInventory";
import DeliveryDashboard from "./Components/Staff/Delivery/DeliveryDashboard/DeliveryDashboard";
import DeliveryManagerDashboard from "./Components/Staff/DeliveryManager/DeliveryManagerDashboard/DeliveryManagerDashboard";
import DeliveryTakenOrderPage from "./Components/Staff/Delivery/DeliveryTakenOrderPage/DeliveryTakenOrderPage";
import UnregisterHomeDeliveryStaffRegisterFrom from "./Components/Website/DeliveryStaffRegisterFrom/UnregisterHomeDeliveryStaffRegisterFrom/UnregisterHomeDeliveryStaffRegisterFrom";
import RegisterHomeDeliveryStaffRegisterFrom from "./Components/Website/DeliveryStaffRegisterFrom/RegisterHomeDeliveryStaffRegisterFrom/RegisterHomeDeliveryStaffRegisterFrom";
import AdminDashboard from "./Components/Staff/Admin/AdminDashboard/AdminDashboard";
import AdminEditMenu from "./Components/Staff/Admin/AdminEditMenu/AdminEditMenu";
import AdminEditMenuPage from "./Components/Staff/Admin/MenuPage/AdminEditMenuPage";
import AdminAddMenuPage from "./Components/Staff/Admin/MenuPage/AdminMenuPage";
import UserComplainPage from "./Components/Website/UserComplainPage/UserComplainPage";
import CustomerManagerDashboard from "./Components/Staff/CustomerManager/CustomerManagerDashboard/CustomerManagerDashboard";
function App() {
  return (
    <Routes>
      {/* Home  import AdminDashboard from "./Components/Staff/Admin/AdminDashboard/AdminDashboard";
 */}
      



     

      {/* Customer Protected Pages */}

      {/* Staff Protected Pages */}

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<UnregisterHome />} />
      <Route path="/stafflogingo" element={<StaffLogin />} />

      {/* Unregister Navbar */}
      <Route path="/UnregisterHome"element={  <UnregisterHome />}/>
      <Route path="/UNregisterMenu"element={  <UnregisterMenu /> }/>
      <Route path="/UNregisterContactUS"element={  <UnregisterContactUs /> }/>
      <Route path="/UnregisterAboutUs"element={  <UnregisterAboutUS /> }/>
      <Route path="/UNregisterlogin"element={  <CustomerLogin /> }/>
      <Route path="/UNRegisterRegister"element={  <CustomerRegister />}/>
      
      {/* Customer Login */}
      <Route path="/ClodeIconLoginHome" element={<UnregisterHome />} />
      <Route path="/customer-register" element={<CustomerRegister />} />

      {/* Customer Register */}
      <Route path="/RegisterfromCloseicon" element={<UnregisterHome />} />
      <Route path="/Registertcustomer-login" element={<CustomerLogin />} />
      <Route path="/customer-loginpage" element={<CustomerLogin />} />


      {/* Register Navbar */}
      <Route path="/RegisterUserAboutUs" element={<ProtectedRoute><RegisterAboutUS /></ProtectedRoute>}/>
      <Route path="/RegisterHome" element={<ProtectedRoute><RegisterHome /></ProtectedRoute>}/>
      <Route path="/RegisterUserContactUS" element={<ProtectedRoute><RegisterContactUs /></ProtectedRoute>}/>
      <Route path="/RegisterUserMenu" element={<ProtectedRoute><RegisterMenu /></ProtectedRoute>}/>
      <Route path="/customer-Logout" element={<CustomerLogin />}/>
      <Route path="/Cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>}/>
      <Route path="/UserProfile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>}/>
      <Route path="/RegisterUserComplain" element={<ProtectedRoute><UserComplainPage /></ProtectedRoute>}/>


      {/* Stuff Login*/} 
      <Route path="/admin-dashboard"element={<StaffProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></StaffProtectedRoute>}/>  
      <Route path="/staff-login" element={<StaffLogin />}/>
      <Route path="/vendor-dashboard"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></StaffProtectedRoute>}/>
      <Route path="/delivery-dashboard"element={<StaffProtectedRoute allowedRoles={["delivery"]}><DeliveryDashboard /></StaffProtectedRoute>}/>
      <Route path="/delivery-manager-dashboard"element={<StaffProtectedRoute allowedRoles={["delivery manager"]}><DeliveryManagerDashboard /></StaffProtectedRoute>}/>
      <Route path="/customer-manager-dashboard"element={<StaffProtectedRoute allowedRoles={["customer manager"]}><CustomerManagerDashboard /></StaffProtectedRoute>}/>


      {/* Unregister Menu */}
      <Route path="/UnregisterMenuLogin" element={<CustomerLogin />}/>

      {/* Unregister Home */}
      <Route path="/UnregisterHomeDeliveryApplicationForm" element={<UnregisterHomeDeliveryStaffRegisterFrom />}/>
      <Route path="/SubmittedApplicationUnregisterHome" element={<UnregisterHome />}/>

      {/* Register Home */}
      <Route path="/DeliveryApplicationFormRegisterHome1" element={<ProtectedRoute><RegisterHomeDeliveryStaffRegisterFrom /></ProtectedRoute>}/>
      <Route path="/registereddeliverystafffrom" element={<ProtectedRoute><RegisterHome /></ProtectedRoute>}/>


      {/* Register Menu */}
      <Route path="/confirm-order" element={<ProtectedRoute><ConfirmOrder /></ProtectedRoute>}/>

      {/* Complain */}
        <Route path="/registeredhomecomplain" element={<ProtectedRoute><RegisterHome /></ProtectedRoute>}/>

      {/* Cart */}registeredhomecomplain
      <Route path="/customerBrowseMenu" element={<ProtectedRoute><RegisterMenu /></ProtectedRoute>}/>
      <Route path="/customerContinueShopping" element={<ProtectedRoute><RegisterMenu /></ProtectedRoute>}/>
      <Route path="/Payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}/>

      {/* Cart */}
      <Route path="/CustomerPaymentSucsse" element={<ProtectedRoute><RegisterHome /></ProtectedRoute>}/>

      {/* Vender */}
      <Route path="/vendor-orders"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorOrders /></StaffProtectedRoute>}/>
      <Route path="/vendor-order/:orderId"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorOrderProcessing /></StaffProtectedRoute>}/>
      <Route path="/vendor-completed-orders"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorCompletedOrders /></StaffProtectedRoute>}/>
      <Route path="/vendor/edit-menu/:id"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorEditMenuPage /></StaffProtectedRoute>}/>
      <Route path="/vendor/add-menu"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorAddMenuPage /></StaffProtectedRoute>}/>
      <Route path="/vendor/add-inventory"element={<StaffProtectedRoute allowedRoles={["vendor"]}><VendorAddInventory /></StaffProtectedRoute>}/>

      {/* Delivery */}
      <Route path="/delivery-taken-order/:orderId" element={<StaffProtectedRoute allowedRoles={["delivery"]}><DeliveryTakenOrderPage /></StaffProtectedRoute>}/>
      <Route path="/delivery-dashboard/finishOrder" element={<StaffProtectedRoute allowedRoles={["delivery"]}><DeliveryDashboard /></StaffProtectedRoute>}/>

      {/* Admin */}
      <Route path="/admin/edit-menu/:id"element={<StaffProtectedRoute allowedRoles={["admin"]}><AdminEditMenuPage /></StaffProtectedRoute>}/>
      <Route path="/admin/add-menu"element={<StaffProtectedRoute allowedRoles={["admin"]}><AdminAddMenuPage /></StaffProtectedRoute>}/>







    </Routes>
  );
}

export default App;