import React from 'react'
import PropTypes from 'prop-types'
import { noop, Wizard, Icon, Button } from 'patternfly-react'
import WizardPatternBody from './WizardPatternBody'
import { wizardStepShape } from 'patternfly-react/dist/js/components/Wizard/Patterns/WizardPatternConstants'

/**
 * WizardPattern - the Wizard Pattern Body component.
 */
const WizardPattern = ({
  id,
  steps,
  activeStepIndex,
  onStepChanged,
  onNext,
  onBack,
  nextStepDisabled,
  title,
  loadingTitle,
  loadingMessage,
  show,
  onFinalStepClick,
  onHide,
  onExited,
  stepButtonsDisabled,
  cancelText,
  backText,
  nextText,
  closeText,
  loading,
  nextButtonRef,
  bodyHeader,
  container,
  children,
}) => {
  const onFirstStep = activeStepIndex === 0
  const onFinalStep = activeStepIndex === steps.length - 1

  const onHideClick = () => {
    onHide(onFinalStep)
  }

  const onBackClick = () => {
    goToStep(Math.max(activeStepIndex - 1, 0))
  }

  const onNextClick = () => {
    goToStep(Math.min(activeStepIndex + 1, steps.length - 1))
  }

  const getStep = (index = activeStepIndex) => steps[index]

  const getPrevStep = (relativeToIndex = activeStepIndex) =>
    relativeToIndex > 0 && steps[relativeToIndex - 1]

  const getNextStep = (relativeToIndex = activeStepIndex) =>
    relativeToIndex < steps.length - 1 && steps[relativeToIndex + 1]

  const activeStep = getStep()

  const goToStep = newStepIndex => {
    if (shouldPreventGoToStep(newStepIndex)) return
    if (newStepIndex === activeStepIndex + 1) {
      const stepOnNextResult = activeStep.onNext && activeStep.onNext()
      const propOnNextResult = onNext(newStepIndex)
      const stepFailed =
        stepOnNextResult === false || propOnNextResult === false
      if (stepFailed) return
    }
    if (newStepIndex === activeStepIndex - 1) {
      const stepFailed = onBack(newStepIndex) === false
      if (stepFailed) return
    }
    if (onStepChanged) onStepChanged(newStepIndex)
  }

  const shouldPreventGoToStep = newStepIndex => {
    const targetStep = getStep(newStepIndex)
    const stepBeforeTarget = getPrevStep(newStepIndex)

    const preventExitActive = activeStep.preventExit
    const preventEnterTarget =
      targetStep.preventEnter ||
      (stepBeforeTarget && stepBeforeTarget.isInvalid)
    const nextStepClicked = newStepIndex === activeStepIndex + 1

    return (
      preventExitActive ||
      preventEnterTarget ||
      (nextStepClicked && nextStepDisabled)
    )
  }

  const activeStepStr = (activeStepIndex + 1).toString()

  const prevStepUnreachable =
    onFirstStep || activeStep.preventExit || getPrevStep().preventEnter

  // nextStepUnreachable is stWebAdminBodyModalnalStep, because the Next button turns into a Close button
  const nextStepUnreachable =
    nextStepDisabled ||
    activeStep.isInvalid ||
    activeStep.preventExit ||
    getNextStep().preventEnterWebAdminBodyModal

  return (
    <Wizard
      id={id}
      show={show}
      onHide={onHideClick}
      onExited={onExited}
      container={container}
    >
      <Wizard.Header onClose={onHideClick} title={title} />
      <Wizard.Body>
        {bodyHeader}
        <WizardPatternBody
          loadingTitle={loadingTitle}
          loadingMessage={loadingMessage}
          loading={loading}
          steps={steps}
          activeStepIndex={activeStepIndex}
          activeStepStr={activeStepStr}
          goToStep={goToStep}
          nextStepDisabled={nextStepDisabled}
          stepButtonsDisabled={stepButtonsDisabled}
        />
      </Wizard.Body>
      <Wizard.Footer>
        <Button
          bsStyle='default'
          onClick={onBackClick}
          disabled={prevStepUnreachable}
          id={`${id}-action-previous-step`}
        >
          <Icon type='fa' name='angle-left' />
          {backText}
        </Button>
        <Button
          id={onFinalStep ? `${id}-action-finish` : `${id}-action-next-step`}
          bsStyle='primary'
          onClick={onFinalStep ? onFinalStepClick : onNextClick}
          disabled={nextStepUnreachable}
          ref={nextButtonRef}
        >
          {onFinalStep
            ? (
              closeText
            )
            : (
              <>
                {nextText}
                <Icon type='fa' name='angle-right' />
              </>
            )}
        </Button>
        <Button bsStyle='default' className='btn-cancel' onClick={onHideClick} id={`${id}-action-cancel`}>
          {cancelText}
        </Button>
      </Wizard.Footer>
      {children}
    </Wizard>
  )
}

WizardPattern.propTypes = {
  id: PropTypes.string,
  activeStepIndex: PropTypes.number.isRequired,
  show: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onHide: PropTypes.func,
  onExited: PropTypes.func,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  onFinalStepClick: PropTypes.func,
  onStepChanged: PropTypes.func,
  loadingTitle: PropTypes.string,
  loadingMessage: PropTypes.string,
  loading: PropTypes.bool,
  cancelText: PropTypes.string,
  backText: PropTypes.string,
  nextText: PropTypes.string,
  closeText: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.shape(wizardStepShape)),
  nextStepDisabled: PropTypes.bool,
  stepButtonsDisabled: PropTypes.bool,
  nextButtonRef: PropTypes.func,
  bodyHeader: PropTypes.node,
  container: PropTypes.any,
  children: PropTypes.node,
}

WizardPattern.defaultProps = {
  show: false,
  title: '',
  onHide: noop,
  onExited: noop,
  onBack: noop,
  onNext: noop,
  onFinalStepClick: noop,
  onStepChanged: noop,
  loadingTitle: 'Loading Wizard...',
  loadingMessage: 'Loading...',
  loading: false,
  cancelText: 'Cancel',
  backText: 'Back',
  nextText: 'Next',
  closeText: 'Close',
  steps: [],
  nextStepDisabled: false,
  stepButtonsDisabled: false,
  nextButtonRef: noop,
  bodyHeader: null,
  children: null,
}

WizardPattern.displayName = 'WizardPattern'

export default WizardPattern
