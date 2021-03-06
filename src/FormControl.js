/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';

import Input from './Input';
import ErrorMessage from './ErrorMessage';

import { getUnhandledProps, defaultProps, prefix } from './utils';

type PlacementEightPoints =
  | 'bottomLeft'
  | 'bottomRight'
  | 'topLeft'
  | 'topRight'
  | 'leftTop'
  | 'rightTop'
  | 'leftBottom'
  | 'rightBottom';

type Props = {
  name: string,
  checkTrigger?: 'change' | 'blur' | 'none',
  accepter: React.ElementType,
  onChange?: (value: any, event: SyntheticEvent<*>) => void,
  onBlur?: (event: SyntheticEvent<*>) => void,
  classPrefix?: string,
  errorMessage?: React.Node,
  errorPlacement?: PlacementEightPoints
};

type State = {
  checkResult?: Object,
  value?: any
};

class FormControl extends React.Component<Props, State> {
  static defaultProps = {
    accepter: Input,
    errorPlacement: 'bottomLeft'
  };

  static contextTypes = {
    form: PropTypes.object
  };

  constructor(props: Props, context: Object) {
    super(props, context);
    if (!context.form) {
      throw new Error('FormControl must be inside a component decorated with <Form>');
    }

    const { formValue = {}, formDefaultValue = {} } = context.form;
    const name = props.name;

    this.state = {
      checkResult: {},
      value: formValue[name] || formDefaultValue[name]
    };
  }

  getCheckTrigger() {
    const { checkTrigger } = this.context.form;
    return this.props.checkTrigger || checkTrigger;
  }

  handleFieldChange = (value: any, event: SyntheticEvent<*>) => {
    const { name, onChange } = this.props;
    const { onFieldChange } = this.context.form;
    const checkTrigger = this.getCheckTrigger();
    const checkResult = this.handleFieldCheck(value, checkTrigger === 'change');
    this.setState({ checkResult, value });
    onFieldChange(name, value, event);
    onChange && onChange(value, event);
  };

  handleFieldBlur = (event: SyntheticEvent<*>) => {
    const { onBlur } = this.props;
    const checkTrigger = this.getCheckTrigger();
    this.handleFieldCheck(this.state.value, checkTrigger === 'blur');
    onBlur && onBlur(event);
  };

  handleFieldCheck = (value: any, isCheckTrigger: boolean, callback?: Function) => {
    const { name } = this.props;
    const { onFieldError, onFieldSuccess, model } = this.context.form;

    const checkResult = model.checkForField(name, value);

    if (isCheckTrigger) {
      if (checkResult.hasError) {
        onFieldError(name, checkResult.errorMessage, callback);
      } else {
        onFieldSuccess(name, callback);
      }
    }

    return checkResult;
  };

  render() {
    const {
      name,
      accepter: Component,
      classPrefix,
      errorPlacement,
      errorMessage,
      ...props
    } = this.props;

    const { formValue = {}, formDefaultValue = {} } = this.context.form;
    const unhandled = getUnhandledProps(FormControl, props);
    const addPrefix = prefix(classPrefix);
    const hasError = !!errorMessage;

    return (
      <div className={addPrefix('wrapper')}>
        <Component
          {...unhandled}
          name={name}
          onChange={this.handleFieldChange}
          onBlur={this.handleFieldBlur}
          defaultValue={formDefaultValue[name]}
          value={formValue[name]}
        />
        <ErrorMessage
          show={hasError}
          className={addPrefix('message-wrapper')}
          placement={errorPlacement}
        >
          {errorMessage}
        </ErrorMessage>
      </div>
    );
  }
}

export default defaultProps({
  classPrefix: 'form-control'
})(FormControl);
