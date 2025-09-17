import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "pos",
  password: "root",
  port: 5432,
});

db.connect()

import bcrypt from "bcrypt";



// Get next invoice number for a given date
app.post("/nextinvoiceno", async (req, res) => {
  try {
    const { invoiceDate } = req.body;

    if (!invoiceDate) {
      return res.json({ message: "missing date" });
    }

    const datePrefix = invoiceDate.replace(/-/g, ""); // e.g. "20250916"

    // Find max invoice_no for that day
    const maxRes = await db.query(
      `SELECT MAX(invoice_no) AS max_no
       FROM transaction_master
       WHERE invoice_no LIKE $1`,
      [datePrefix + "%"]
    );

    let seq = 1;
    if (maxRes.rows[0].max_no) {
      const lastSeq = parseInt(maxRes.rows[0].max_no.slice(8)); // last digits
      seq = lastSeq + 1;
    }

    const nextInvoiceNo = datePrefix + seq.toString().padStart(3, "0");

    res.json({
      message: "success",
      invoiceNo: nextInvoiceNo,
    });
  } catch (error) {
    console.error("Error in /nextinvoiceno:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/updaterights", async (req, res) => {
  try {
    const tot = req.body.total;

    for (const user of tot) {
      await db.query(
        `UPDATE menu_master 
         SET item = $1, 
             customer = $2, 
             rights = $3,
             company = $4,
             monthly_calendar = $5,
             yearly_calendar = $6,
             manager = $7,
             salesman = $8,
             customer_type = $9,
             supplier_type = $10,
             supplier = $11,
             item_group = $12,
             item_section = $13,
             item_brand = $14,
             currency = $15
         WHERE username = $16`,
        [
          user.item,
          user.customer,
          user.rights,
          user.company,
          user.monthly_calendar,
          user.yearly_calendar,
          user.manager,
          user.salesman,
          user.customer_type,
          user.supplier_type,
          user.supplier,
          user.item_group,
          user.item_section,
          user.item_brand,
          user.currency,
          user.username,
        ]
      );
    }

    res.json({ status: "success" });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});






app.get("/getallusers",async(req,res)=>{
  let result=await db.query("select * from menu_master")
  console.log(result.rows)
  res.json(result.rows)
})
// Get all customers
app.post("/getallcustomers", async (req, res) => {
  let result = await db.query("SELECT * FROM customer_master");
  
  res.json(result.rows);
});

// Insert customer with duplicate check
app.post("/insertcustomer", async (req, res) => {
  const { customer_code, customer_name } = req.body;

  if (!customer_code || !customer_name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const result = await db.query(
      `INSERT INTO customer_master (customer_code, customer_name)
       VALUES ($1, $2)
       RETURNING *;`,
      [customer_code, customer_name]
    );
    res.status(200).json({ message: "success", inserted: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Customer code already exists" });
    } else {
      console.error("Insert error:", err.message);
      res.status(500).json({ message: "Insert failed", error: err.message });
    }
  }
});

// Delete customer
app.post("/deletecustomer", async (req, res) => {
  try {
    await db.query("DELETE FROM customer_master WHERE customer_code = $1", [req.body.code]);
    res.json("success");
  } catch (err) {
    if (err.code === "23503") {
      res.status(400).json({ message: "Cannot delete customer: existing transactions found." });
    } else {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Delete failed", error: err.message });
    }
  }
});



app.post("/deleteitem",async(req,res)=>{
   console.log(req.body.code)
  await db.query("delete from item_master where item_code=$1",[req.body.code])
  res.json("success")
})
app.post("/getallitems",async(req,res)=>{
  let result=await db.query("select * from item_master")
 res.json(result.rows)

})
app.post("/insertitem", async (req, res) => {
  const { item_code, item_name, unit, sales_price } = req.body;

  if (!item_code || !item_name || !unit || sales_price === undefined) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const result = await db.query(
      `INSERT INTO item_master (item_code, item_name, unit, sales_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [item_code, item_name, unit, parseInt(sales_price)]
    );

    res.status(200).json({ message: "success", inserted: result.rows[0] });

  } catch (err) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Item code already exists" });
    } else {
      console.error("Insert error:", err.message);
      res.status(500).json({ message: "Insert failed", error: err.message });
    }
  }
});


app.post("/getrights", async (req, res) => {
  const { name } = req.body;

  try {
    const result = await db.query("SELECT * FROM menu_master WHERE username = $1", [name]);

    if (result.rows.length === 0) {
      return res.json({ message: "fail" });
    }

    res.json({ val: result.rows[0], message: "success" }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});
app.post("/usersubmit", async (req, res) => {
  const { name, password, typ } = req.body;

  try {
    if (typ === "register") {
      const userCheck = await db.query("SELECT * FROM user_master WHERE name = $1", [name]);

      if (userCheck.rows.length === 0) {
        
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
          "INSERT INTO user_master (name, password) VALUES ($1, $2)",
          [name, hashedPassword]
        );
        await db.query("insert into menu_master (username) values ($1)",[name])
        return res.json("registered successfully");
      } else {
        return res.json("user already exists");
      }
    } else {
      const user = await db.query("SELECT * FROM user_master WHERE name = $1", [name]);

      if (user.rows.length === 0) {
        return res.json("invalid user");
      }

      const hashedPassword = user.rows[0].password;

      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (!isMatch) {
        return res.json("invalid password");
      }

      return res.json("login success");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("server error");
  }
});



app.post("/getinvoicenumber", async (req, res) => {
    try {
        let result = await db.query("SELECT MAX(Invoice_no) FROM Transaction_master");
        
        if (result.rows[0].max == null) {
            res.json(1);
        } else {
            let x = result.rows[0].max + 1;
            res.json(x);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/getcustomername",async(req,res)=>{

    let result=await db.query("select Customer_name from Customer_master where Customer_Code=$1",[req.body.cid])
    if (result.rows.length==0){
        res.json("invalid customer")
    }
    else{
        res.json(result.rows[0].customer_name)
    }
})

app.post("/getitemname",async(req,res)=>{
    let result=await db.query("select item_name,unit,sales_price from item_master where item_Code=$1",[req.body.code])
    if (result.rows.length==0){
        res.json("invalid user")
    }
    else{
        res.json(result.rows[0])
    }

})

app.post("/getitemcode", async (req, res) => {
  try {
    let result = await db.query("SELECT item_code FROM item_master");
    res.json(result.rows); 
  } catch (error) {
    console.error("Error fetching item codes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/transmaster", async (req, res) => {
  try {
    const bd = req.body.details;
    const { invoiceDate, invoiceType, customerCode, comments } = bd;

   
    const result = await db.query(
      "SELECT COUNT(*) AS c FROM customer_master WHERE customer_code = $1",
      [customerCode]
    );

    if (parseInt(result.rows[0].c) > 0) {
      
      const insertResult = await db.query(
  "INSERT INTO transaction_master (invoice_date, customer_code, invoice_type, comment_s) VALUES ($1, $2, $3, $4) RETURNING invoice_no",
  [invoiceDate, customerCode, invoiceType, comments]
);

res.json({ msg: "new transaction header created", m: insertResult.rows[0].invoice_no });

     
    } else {
      return res.json({msg:"incorrect customer code"});
    }
  } catch (error) {
    console.error("Error in /transmaster:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});




app.post("/saveinvoice", async (req, res) => {
  const { invoiceDetails, itemList } = req.body;
  let { invoiceDate, invoiceType, customerCode, comments } = invoiceDetails;

  try {
    await db.query("BEGIN");

    // 🔹 Normalize invoiceDate
    let normalizedDate;
    if (invoiceDate.includes("-")) {
      const parts = invoiceDate.split("-");
      if (parts[0].length === 4) {
        // already YYYY-MM-DD
        normalizedDate = invoiceDate;
      } else {
        // assume DD-MM-YYYY
        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } else {
      normalizedDate = invoiceDate;
    }

    // Validate customer exists
    const result = await db.query(
      "SELECT COUNT(*) AS c FROM customer_master WHERE customer_code = $1",
      [customerCode]
    );
    if (parseInt(result.rows[0].c) === 0) {
      await db.query("ROLLBACK");
      return res.json({ message: "invalid customer" });
    }

    // Count invoices for this date
    const countResult = await db.query(
      `SELECT COUNT(*) AS cnt 
       FROM transaction_master 
       WHERE invoice_date = $1::date`,
      [normalizedDate]
    );

    const todayStr = normalizedDate.replace(/-/g, ""); // YYYYMMDD
    const nextCount = parseInt(countResult.rows[0].cnt) + 1;
    const invoiceNo = `${todayStr}${String(nextCount).padStart(3, "0")}`;

    
    await db.query(
      `INSERT INTO transaction_master 
       (invoice_no, invoice_date, customer_code, invoice_type, comment_s) 
       VALUES ($1, $2, $3, $4, $5)`,
      [invoiceNo, normalizedDate, customerCode, invoiceType, comments]
    );

    
    for (let i = 0; i < itemList.length; i++) { 3
      const item = itemList[i];
      await db.query(
        `INSERT INTO transaction_detail
         (invoice_no, transaction_code, item_code, unit, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          invoiceNo,
          i + 1,
          item.itemCode,
          item.unit,
          parseFloat(item.qty),
          parseFloat(item.unitPrice),
          parseFloat(item.totalPrice),
        ]
      );
    }

    await db.query("COMMIT");

    res.json({ message: "success", invoiceNo });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error saving invoice:", error);
    res.status(500).json({ message: "error", error: error.message });
  }
});











app.listen(3000,()=>{
    console.log("3000")
})