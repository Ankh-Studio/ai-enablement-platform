/**
 * Persona Factory
 *
 * Factory for creating and managing expert personas
 */

import type { PersonaConfig, PersonaType } from '../types/persona';
import type { BasePersona } from './base-persona';
import { ConsultantPersona } from './consultant-persona';

export class PersonaFactory {
  private static personas: Map<
    PersonaType,
    (enableLLMCoalescing?: boolean) => BasePersona
  > = new Map([
    [
      'consultant',
      (enableLLMCoalescing = false) =>
        new ConsultantPersona(enableLLMCoalescing),
    ],
    // Add other personas as they're implemented
    // ['evangelist', () => new EvangelistPersona()],
    // ['teamlead', () => new TeamLeadPersona()],
  ]);

  private static configs: Map<PersonaType, PersonaConfig> = new Map([
    [
      'consultant',
      {
        type: 'consultant',
        name: 'AI Strategy Consultant',
        description:
          'Strategic advisor focused on business value, ROI, and organizational transformation',
        expertise: ['AI Strategy', 'Business Transformation', 'ROI Analysis'],
        focus: ['business-impact', 'roi', 'governance'],
        tone: 'formal',
        targetAudience: ['executives', 'managers'],
      },
    ],
    // Add other configs as implemented
  ]);

  static createPersona(
    type: PersonaType,
    enableLLMCoalescing = false,
  ): BasePersona {
    const personaFactory = PersonaFactory.personas.get(type);
    if (!personaFactory) {
      throw new Error(
        `Persona type '${type}' is not supported. Available types: ${Array.from(PersonaFactory.personas.keys()).join(', ')}`,
      );
    }
    return personaFactory(enableLLMCoalescing);
  }

  static getAvailablePersonas(): PersonaType[] {
    return Array.from(PersonaFactory.personas.keys());
  }

  static getPersonaConfig(type: PersonaType): PersonaConfig | undefined {
    return PersonaFactory.configs.get(type);
  }

  static getAllConfigs(): Map<PersonaType, PersonaConfig> {
    return new Map(PersonaFactory.configs);
  }

  static isPersonaAvailable(type: PersonaType): boolean {
    return PersonaFactory.personas.has(type);
  }
}
