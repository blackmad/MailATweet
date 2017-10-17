import React from 'react'

export const renderField = ({ input, label, type, placeholder, meta: { touched, error, warning } }) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={placeholder} type={type}/>
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
)

export const renderTextArea = ({ input, label, type, placeholder, meta: { touched, error, warning } }) => (
    <div>
        <label>{label}</label>
        <div>
            <textarea {...input} placeholder={placeholder} rows="10" cols="40"/>
            {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    </div>
);

