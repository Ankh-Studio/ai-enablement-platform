/**
 * Persona Factory
 *
 * Factory for creating and managing expert personas
 */

import type { PersonaConfig, PersonaType } from '../types/persona';
import type { BasePersona } from './base-persona';
import { ConsultantPersona } from './consultant-persona';
import { DanaShahPersona } from './dana-shah-persona';
import { LeoAlvarezPersona } from './leo-alvarez-persona';

export class PersonaFactory {
  private static personas: Map<
    PersonaType,
    (enableLLMCoalescing?: boolean) => BasePersona
  > = new Map() as Map<
    PersonaType,
    (enableLLMCoalescing?: boolean) => BasePersona
  >;

  static {
    this.personas.set(
      'consultant',
      (enableLLMCoalescing = false) =>
        new ConsultantPersona(enableLLMCoalescing),
    );
    this.personas.set(
      'dana-shah',
      (enableLLMCoalescing = false) => new DanaShahPersona(enableLLMCoalescing),
    );
    this.personas.set(
      'leo-alvarez',
      (enableLLMCoalescing = false) =>
        new LeoAlvarezPersona(enableLLMCoalescing),
    );
  }

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
    [
      'dana-shah',
      {
        type: 'dana-shah',
        name: 'Dana Shah',
        description:
          'AI-hesitant senior developer focused on long-term system health and craftsmanship',
        expertise: [
          'System Architecture',
          'Code Review',
          'Technical Leadership',
        ],
        focus: ['maintainability', 'code-quality', 'review-process'],
        tone: 'formal',
        targetAudience: ['senior-developers', 'tech-leads', 'architects'],
      },
    ],
    [
      'leo-alvarez',
      {
        type: 'leo-alvarez',
        name: 'Leo Alvarez',
        description:
          'AI-enthusiastic junior developer focused on learning and quick productivity gains',
        expertise: [
          'Frontend Development',
          'API Integration',
          'Modern Frameworks',
        ],
        focus: ['learning', 'productivity', 'unblocking', 'skill-development'],
        tone: 'friendly',
        targetAudience: ['junior-developers', 'team-leads', 'mentors'],
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
