/**
 * Persona Factory
 *
 * Factory for creating and managing expert personas
 */

import { BasePersona } from "./base-persona";
import { ConsultantPersona } from "./consultant-persona";
import { PersonaType, PersonaConfig } from "../types/persona";

export class PersonaFactory {
  private static personas: Map<PersonaType, () => BasePersona> = new Map([
    ["consultant", () => new ConsultantPersona()],
    // Add other personas as they're implemented
    // ['evangelist', () => new EvangelistPersona()],
    // ['teamlead', () => new TeamLeadPersona()],
  ]);

  private static configs: Map<PersonaType, PersonaConfig> = new Map([
    [
      "consultant",
      {
        type: "consultant",
        name: "AI Strategy Consultant",
        description:
          "Strategic advisor focused on business value, ROI, and organizational transformation",
        expertise: ["AI Strategy", "Business Transformation", "ROI Analysis"],
        focus: ["business-impact", "roi", "governance"],
        tone: "formal",
        targetAudience: ["executives", "managers"],
      },
    ],
    // Add other configs as implemented
  ]);

  static createPersona(type: PersonaType): BasePersona {
    const personaFactory = this.personas.get(type);
    if (!personaFactory) {
      throw new Error(
        `Persona type '${type}' is not supported. Available types: ${Array.from(this.personas.keys()).join(", ")}`,
      );
    }
    return personaFactory();
  }

  static getAvailablePersonas(): PersonaType[] {
    return Array.from(this.personas.keys());
  }

  static getPersonaConfig(type: PersonaType): PersonaConfig | undefined {
    return this.configs.get(type);
  }

  static getAllConfigs(): Map<PersonaType, PersonaConfig> {
    return new Map(this.configs);
  }

  static isPersonaAvailable(type: PersonaType): boolean {
    return this.personas.has(type);
  }
}
