
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Handle from "./Handle"
import Verify from "./Verify"
import Menu from "./Menu"
import ItemInsert from "./ItemInsert"
import Customer from "./Customer"
import Rights from "./Rights"
import Company from "./Company"
import Salesman from "./Salesman"
import Manager from "./Manager"
import YearlyCalendar from "./YearlyCalendar"   
import Item2 from "./Item2";

import MonthlyCalendar from "./MonthlyCalendar"
function App()
{
   return(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Verify></Verify>}></Route>
      <Route path="/Handle" element={<Handle></Handle>}></Route>
      <Route path="/Menu" element={<Menu></Menu>}></Route>
      <Route path="/ItemInsert" element={<ItemInsert></ItemInsert>}></Route>
      <Route path="/Customer" element={<Customer></Customer>}></Route>
      <Route path="/Rights" element={<Rights></Rights>}></Route>
      <Route path="/Company" element={<Company></Company>}></Route>
      <Route path="/Salesman" element={<Salesman></Salesman>}></Route>
      <Route path="/Manager" element={<Manager></Manager>}></Route>
      <Route path="/YearlyCalendar" element={<YearlyCalendar></YearlyCalendar>}></Route>  
      <Route path="/MonthlyCalendar" element={<MonthlyCalendar></MonthlyCalendar>}></Route>
      <Route path="/Item2" element={<Item2></Item2>}></Route>
    </Routes>
    </BrowserRouter>
   )
}

export default App