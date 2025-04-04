import React from 'react'

function UploadPage() {
  return (
    <div>
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
  <legend className="fieldset-legend">Product Details</legend>
  
  <label className="fieldset-label">Product_name</label>
  <input type="text" className="input" placeholder="My awesome page" />
  
  <label className="fieldset-label">Product_price</label>
  <input type="text" className="input" placeholder="my-awesome-page" />
  
  <label className="fieldset-label">Product_category</label>
  <input type="text" className="input" placeholder="Name" />

  <label className="fieldset-label">Product_color</label>
  <input type="text" className="input" placeholder="Name" />

  <label className="fieldset-label">Product_Description</label>
  <input type="text" className="input" placeholder="Name" />

  <label className="fieldset-label">Product_category</label>
  <input type="Checkbox" className="input" placeholder="Name" />



</fieldset>
    </div>
  )
}

export default UploadPage
