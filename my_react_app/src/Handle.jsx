import React from "react";
import InvoiceForm from "./InvoiceForm";
import ItemForm from "./ItemForm";
import ItemTable from "./ItemTable";
import axios from "axios";
import "./styles.css";
import { useLocation } from "react-router-dom";

function Handle() {
  let location = useLocation();
  let [name, setName] = React.useState("");
  let [invoiceNo, setInvoiceno] = React.useState(null);
  let [itemCode, setItemCode] = React.useState([]);
  let [newItemCode, setNewItemCode] = React.useState([]);
  let [itemList, setItemList] = React.useState([]);
  let [total, setTotal] = React.useState(0);

let [invoiceDetails, setInvoiceDetails] = React.useState({
  invoiceDate: new Date().toISOString().split("T")[0], // defaults to today
  invoiceType: "cash",
  customerCode: "",
  comments: "",
});


  let [itemDetails, setItemDetails] = React.useState({
    sino: "",
    itemCode: "",
    itemName: "",
    unit: "",
    qty: "",
    unitPrice: "",
    totalPrice: 0,
  });

  let [customerName, setCustomerName] = React.useState("");

  // Load item codes at mount
  React.useEffect(() => {
    let func = async function () {
      const result = await axios.post("http://localhost:3000/getitemcode");
      setItemCode(result.data);
      setNewItemCode(result.data);
    };
    func();
  }, []);

  // Check login state
  React.useEffect(() => {
    if (location.state) {
      setName(location.state.name);
    } else {
      alert("Session expired. Please log in again.");
    }
  }, [location.state]);

  // Handle invoice form change
  let handleChange = async function (event) {
    let { name, value } = event.target;

    if (name === "customerCode" && value.length >= 2) {
      let result = await axios.post("http://localhost:3000/getcustomername", {
        cid: value,
      });
      setCustomerName(result.data);
    }

    setInvoiceDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Reserve next invoice number (do NOT insert yet)
  let handleSubmit = async function (event) {
    event.preventDefault();

    if (invoiceDetails.invoiceDate.length === 0) {
      alert("Please enter an invoice date.");
      return;
    }

    try {
      const result = await axios.post("http://localhost:3000/nextinvoiceno", {
        invoiceDate: invoiceDetails.invoiceDate,
      });

      if (result.data.message === "success") {
        setInvoiceno(result.data.invoiceNo);
        alert("Invoice number reserved: " + result.data.invoiceNo);
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.error("Error fetching next invoice:", error.response?.data || error.message);
      alert("Error fetching invoice: " + (error.response?.data?.error || error.message));
    }
  };

  // Handle item form change
  let handleChange2 = async function (event) {
    let { name, value } = event.target;
    setItemDetails((prev) => ({ ...prev, [name]: value }));

    if (name === "itemCode") {
      let matched = itemCode.find(
        (item) => item.item_code.toLowerCase() === value.toLowerCase()
      );

      if (!matched) {
        setNewItemCode(
          itemCode.filter((item) =>
            item.item_code.toLowerCase().includes(value.toLowerCase())
          )
        );
        return;
      }

      let result = await axios.post("http://localhost:3000/getitemname", {
        code: matched.item_code,
      });

      if (result.data !== "invalid user") {
        setItemDetails((prev) => ({
          ...prev,
          itemCode: matched.item_code,
          itemName: result.data.item_name,
          unit: result.data.unit,
          unitPrice: result.data.sales_price,
        }));
        setNewItemCode([]);
      }
    }
  };

  // Add item locally
  const handleItemSubmit = (event) => {
    event.preventDefault();

    const parsedQty = parseFloat(itemDetails.qty);
    const parsedPrice = parseFloat(itemDetails.unitPrice);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Please enter a valid unit price");
      return;
    }

    const updatedItem = {
      ...itemDetails,
      sino: itemList.length + 1,
      totalPrice: parsedQty * parsedPrice,
    };

    const updatedList = [...itemList, updatedItem];
    setItemList(updatedList);

    const totalSum = updatedList.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotal(totalSum);

    setItemDetails({
      sino: "",
      itemCode: "",
      itemName: "",
      unit: "",
      qty: "",
      unitPrice: "",
      totalPrice: 0,
    });
  };

  // Delete item locally
  let handleDelete = function (val) {
    const updatedList = itemList.filter((item) => item.sino !== val.sino);

    const renumbered = updatedList.map((item, index) => ({
      ...item,
      sino: index + 1,
    }));

    setItemList(renumbered);

    const totalSum = renumbered.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotal(totalSum);
  };

  // Save invoice + items with reserved invoiceNo
  let handleFinish = async () => {
    try {
      const result = await axios.post("http://localhost:3000/saveinvoice", {
        invoiceDetails: { ...invoiceDetails, invoiceNo }, // include reserved number
        itemList,
      });

      if (result.data.message === "success") {
        setInvoiceno(result.data.invoiceNo); // confirm number after save
        alert("Invoice saved successfully with total: ₹" + total.toFixed(2));

        // Reset for new invoice
        setInvoiceDetails({
          invoiceDate: new Date().toISOString().split("T")[0],
          invoiceType: "cash",
          customerCode: "",
          comments: "",
        });
        setCustomerName("");
        setItemDetails({
          sino: "",
          itemCode: "",
          itemName: "",
          unit: "",
          qty: "",
          unitPrice: "",
          totalPrice: 0,
        });
        setItemList([]);
        setTotal(0);
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.error("Error saving invoice:", error.response?.data || error.message);
      alert("Error saving invoice: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <div style={{ border: "10px solid black" }}>
        <p>
          INVOICE NO:{" "}
          {invoiceNo ? invoiceNo : "(Invoice number will appear after Submit)"}
        </p>
        <p style={{ fontWeight: "bold", margin: "10px" }}>Welcome, {name}</p>

        <InvoiceForm
          invoiceDetails={invoiceDetails}
          customerName={customerName}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />

        <ItemForm
          itemDetails={itemDetails}
          itemCode={itemCode}
          newItemCode={newItemCode}
          handleChange2={handleChange2}
          handleItemSubmit={handleItemSubmit}
          setNewItemCode={setNewItemCode}
        />
      </div>

      <ItemTable itemList={itemList} handleDelete={handleDelete} total={total} />

      <button onClick={handleFinish}>FINISH</button>
    </div>
  );
}

export default Handle;
