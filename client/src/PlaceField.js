import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';

const AutocompleteItem = ({ formattedSuggestion }) => (
  <div>
    <strong>{ formattedSuggestion.mainText }</strong>{' '}
    <small>{ formattedSuggestion.secondaryText }</small>
  </div>
)

export const PlaceField = ({ input, label, meta: { touched, error }, ...rest }) => {
  const hasError = touched && error;
  const id = input.name;

  const classes={
    input: `form-control form-control-lg${hasError ? ' form-control-danger' : ''}`
  }

  return (
    <div className={`form-group${hasError ? ' has-danger' : ''}`}>
      <label className="form-control-label" htmlFor={id}>{label}</label>
      <PlacesAutocomplete
        id={id}
        {...input}
        {...rest}
        typeAhead={false}
        inputName={input.name}
        autocompleteItem={AutocompleteItem}
        classNames={classes} />
      {hasError && <div className="form-control-feedback">{error}</div>}
    </div>
  );
}