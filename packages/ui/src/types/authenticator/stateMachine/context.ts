import { ValidationError } from '../validator';
import { AuthFormData, AuthFormFields } from '../form';
import {
  AuthChallengeName,
  AmplifyUser,
  UnverifiedContactMethods,
} from '../user';
import { CodeDeliveryDetails as CognitoCodeDeliveryDetails } from 'amazon-cognito-identity-js';
import { LoginMechanism, SignUpAttribute, SocialProvider } from '../attributes';
import { defaultServices } from '../../../machines/authenticator/defaultServices';
import { PasswordSettings } from '..';

/**
 * Data that actor returns when they are done and reach the final state
 */
export interface ActorDoneData {
  /** Any auth form values that needs to be persisted between the actors */
  authAttributes?: AuthFormData;
  /** String that indicates where authMachine should next transition to */
  intent?: string; // TODO: name it more intuitively -- e.g. targetState
  /** User returned by the actor it's done */
  user?: AmplifyUser;
}

/**
 * Context interface for the top-level machine
 */
export interface AuthContext {
  /** Reference to the spawned actor */
  actorRef?: any;
  config?: {
    loginMechanisms?: LoginMechanism[];
    signUpAttributes?: SignUpAttribute[];
    socialProviders?: SocialProvider[];
    formFields?: AuthFormFields;
    initialState?: 'signIn' | 'signUp' | 'resetPassword';
    passwordSettings?: PasswordSettings;
  };
  services?: Partial<typeof defaultServices>;
  user?: AmplifyUser;
  username?: string;
  password?: string;
  code?: string;
  mfaType?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';
  actorDoneData?: Omit<ActorDoneData, 'user'>; // data returned from actors when they finish and reach their final state
  hasSetup?: boolean;
}

export interface CodeDeliveryDetails extends CognitoCodeDeliveryDetails {}

/**
 * Base context for all actors that have auth forms associated
 */
interface BaseFormContext {
  /** Any user attributes set that needs to persist between states */
  authAttributes?: Record<string, any>;
  /** Current challengeName issued by Cognnito */
  challengeName?: AuthChallengeName;
  /** Required attributes for form submission */
  requiredAttributes?: Array<string>;
  /** Maps each input name to tis value */
  formValues?: AuthFormData;
  /** Input (names) that has been blurred at least ones */
  touched?: AuthFormData;
  /** String that indicates where authMachine should next transition to */
  intent?: string;
  /** Error returned from remote service / API */
  remoteError?: string;
  /** Current user inteface the actor is working with */
  user?: AmplifyUser;
  /** Maps each input to its validation error, if any */
  validationError?: ValidationError;
  /** Maps each password validation rule */
  passwordSettings?: PasswordSettings;
  /** Denotes where a confirmation code has been sent to */
  codeDeliveryDetails?: CodeDeliveryDetails;
  /** Default country code for all phone number fields. */
  country_code?: string; // TODO: this one should be customizable as well
  /** TOTP secret code */
  totpSecretCode?: string;
}

// Actor context types
export interface SignInContext extends BaseFormContext {
  loginMechanisms: Required<AuthContext>['config']['loginMechanisms'];
  socialProviders: Required<AuthContext>['config']['socialProviders'];
  formFields?: AuthFormFields;
  attributeToVerify?: string;
  redirectIntent?: string;
  unverifiedContactMethods?: UnverifiedContactMethods;
}
export interface SignUpContext extends BaseFormContext {
  loginMechanisms: Required<AuthContext>['config']['loginMechanisms'];
  socialProviders: Required<AuthContext>['config']['socialProviders'];
  formFields: AuthFormFields;
  unverifiedContactMethods?: UnverifiedContactMethods;
}

export interface ResetPasswordContext extends BaseFormContext {
  username?: string;
  unverifiedContactMethods?: UnverifiedContactMethods;
  formFields?: AuthFormFields;
}

export interface SignOutContext {
  authAttributes?: Record<string, any>;
  challengeName?: AuthChallengeName;
  unverifiedContactMethods?: UnverifiedContactMethods;
  user?: AmplifyUser;
  formFields?: AuthFormFields;
}

/**
 * Context for actors that have forms
 */
export type ActorContextWithForms =
  | SignInContext
  | SignUpContext
  | ResetPasswordContext;

export type AuthActorContext = ActorContextWithForms | SignOutContext;
