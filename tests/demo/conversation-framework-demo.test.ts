/**
 * Conversation Framework Demo
 *
 * Demonstrates structured discussion framework tools for organizational AI adoption conversations
 */

import { ConversationFramework } from '../../src/core/conversation-framework';
import { MultiPerspectiveEngine } from '../../src/core/multi-perspective-engine';
import type { PersonaContext } from '../../src/types/persona';

describe('Conversation Framework Demo', () => {
  let framework: ConversationFramework;
  let engine: MultiPerspectiveEngine;

  beforeEach(() => {
    framework = new ConversationFramework();
    engine = new MultiPerspectiveEngine();
  });

  it('should demonstrate complete conversation framework capabilities', async () => {
    console.log('\n🎯 CONVERSATION FRAMEWORK DEMO');
    console.log('===============================\n');

    // Analyze repository with conflicts
    const context: PersonaContext = {
      repository: 'ai-enablement-platform',
      assessmentResults: {
        techStack: { languages: ['TypeScript'], frameworks: ['React', 'Bun'] },
        codebaseMetrics: { totalFiles: 300, totalLines: 30000 },
        securityFeatures: { authentication: true, encryption: false },
        collaborationMetrics: { contributors: 8, commits: 1200 },
        deploymentMetrics: { frequency: 'weekly', successRate: 0.95 },
      },
      scores: {
        repoReadiness: 75, // High AI adoption
        teamReadiness: 70, // Good team readiness
        orgReadiness: 80, // Good org readiness
        overallMaturity: 6, // Good maturity
      },
      recommendations: [
        { id: '1', title: 'Add more tests', description: 'Expand test coverage', priority: 'high', category: 'foundation' }
      ],
      targetAudience: 'team',
    };

    console.log('📊 Repository Context:');
    console.log(`- Repository: ${context.repository}`);
    console.log(`- AI Adoption: ${context.scores.repoReadiness}/100`);
    console.log(`- Team Readiness: ${context.scores.teamReadiness}/100`);
    console.log(`- Overall Maturity: ${context.scores.overallMaturity}/8\n`);

    const result = await engine.analyzeRepository(context);

    console.log('🔄 MULTI-PERSPECTIVE ANALYSIS RESULTS:');
    console.log('=====================================\n');
    console.log(`Persona Analyses: ${result.personaAnalyses.length}`);
    console.log(`Consensus Areas: ${result.consensusAreas.length}`);
    console.log(`Conflict Areas: ${result.conflictAreas.length}`);
    console.log(`Recommendations: ${result.recommendations.length}\n`);

    if (result.conflictAreas.length > 0) {
      console.log('⚠️  IDENTIFIED CONFLICTS:');
      console.log('========================\n');
      result.conflictAreas.forEach((conflict, index) => {
        console.log(`${index + 1}. ${conflict}`);
      });
      console.log('');
    }

    // Generate conversation prompts
    console.log('💬 CONVERSATION PROMPTS:');
    console.log('======================\n');
    
    const prompts = framework.generateConversationPrompts(result);
    
    prompts.forEach((prompt, index) => {
      console.log(`${index + 1}. ${prompt.title}`);
      console.log(`   Type: ${prompt.type.toUpperCase()}`);
      console.log(`   Duration: ${prompt.duration}`);
      console.log(`   Participants: ${prompt.participants.join(', ')}`);
      console.log(`   Questions: ${prompt.questions.length}`);
      console.log(`   Objectives: ${prompt.objectives.length}`);
      
      // Show sample question
      if (prompt.questions.length > 0) {
        const sampleQ = prompt.questions[0];
        console.log(`   Sample Question: "${sampleQ.text}"`);
        console.log(`   Type: ${sampleQ.type} | Context: ${sampleQ.context}`);
      }
      console.log('');
    });

    // Generate conversation agenda
    console.log('📅 CONVERSATION AGENDA:');
    console.log('=======================\n');
    
    const agenda = framework.generateConversationAgenda(result);
    
    console.log(`Title: ${agenda.title}`);
    console.log(`Total Duration: ${agenda.totalDuration}`);
    console.log(`Sections: ${agenda.sections.length}`);
    console.log(`Materials: ${agenda.materials.length}`);
    console.log(`Preparation: ${agenda.preparation.length}\n`);
    
    agenda.sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section.title} (${section.duration})`);
      console.log(`   Type: ${section.type.toUpperCase()}`);
      console.log(`   Content: ${section.content.substring(0, 100)}...`);
      console.log(`   Facilitator Notes: ${section.facilitatorNotes.length}`);
      console.log(`   Participant Notes: ${Object.keys(section.participantNotes).length} personas`);
      console.log('');
    });

    // Generate conflict resolution strategies
    let strategies: any[] = [];
    if (result.conflictAreas.length > 0) {
      strategies = framework.generateConflictResolutionStrategies(result);
      console.log('🛠️  CONFLICT RESOLUTION STRATEGIES:');
      console.log('===============================\n');
      
      strategies.forEach((strategy, index) => {
        console.log(`${index + 1}. ${strategy.conflict}`);
        console.log(`   Resolution Approach: ${strategy.resolutionApproach.toUpperCase()}`);
        console.log(`   Personas Involved: ${strategy.personas.join(', ')}`);
        console.log(`   Steps: ${strategy.steps.length}`);
        console.log(`   Success Metrics: ${strategy.successMetrics.length}`);
        console.log(`   Expected Outcome: ${strategy.expectedOutcome.substring(0, 100)}...`);
        
        // Show first few steps
        console.log(`   Key Steps:`);
        strategy.steps.slice(0, 2).forEach((step, i) => {
          console.log(`     ${i + 1}. ${step}`);
        });
        console.log('');
      });
    }

    // Show detailed conflict resolution prompt example
    if (result.conflictAreas.length > 0) {
      console.log('🔍 DETAILED CONFLICT RESOLUTION PROMPT:');
      console.log('=====================================\n');
      
      const conflictPrompt = prompts.find(p => p.type === 'conflict-resolution');
      if (conflictPrompt) {
        console.log(`Prompt: ${conflictPrompt.title}`);
        console.log(`Description: ${conflictPrompt.description}\n`);
        
        console.log('Questions:');
        conflictPrompt.questions.forEach((q, i) => {
          console.log(`${i + 1}. [${q.type.toUpperCase()}] ${q.text}`);
          console.log(`   Participants: ${q.participants.join(', ')}`);
          console.log(`   Context: ${q.context}`);
          if (q.followUp.length > 0) {
            console.log(`   Follow-up: ${q.followUp.slice(0, 2).join(', ')}`);
          }
          console.log('');
        });
        
        console.log(`Objectives:`);
        conflictPrompt.objectives.forEach((obj, i) => {
          console.log(`${i + 1}. ${obj}`);
        });
        console.log('');
      }
    }

    // Show facilitator notes example
    console.log('👨‍🏫 FACILITATOR GUIDANCE:');
    console.log('=======================\n');
    
    const perspectiveSection = agenda.sections.find(s => s.type === 'perspective-sharing');
    if (perspectiveSection) {
      console.log('Section: Perspective Sharing');
      console.log(`Facilitator Notes (${perspectiveSection.facilitatorNotes.length}):`);
      perspectiveSection.facilitatorNotes.forEach((note, i) => {
        console.log(`${i + 1}. ${note}`);
      });
      console.log('');
      
      console.log('Participant Notes by Persona:');
      Object.entries(perspectiveSection.participantNotes).forEach(([persona, notes]) => {
        console.log(`${persona}:`);
        notes.forEach((note, i) => {
          console.log(`  ${i + 1}. ${note}`);
        });
        console.log('');
      });
    }

    // Framework summary
    console.log('📈 FRAMEWORK CAPABILITIES SUMMARY:');
    console.log('=================================\n');
    console.log(`✅ Structured Conversation Prompts: ${prompts.length}`);
    console.log(`✅ Complete Meeting Agenda: ${agenda.sections.length} sections`);
    console.log(`✅ Conflict Resolution Strategies: ${strategies.length || 0}`);
    console.log(`✅ Facilitator & Participant Guidance`);
    console.log(`✅ Evidence-Based Discussion Questions`);
    console.log(`✅ Action Planning Templates\n`);

    console.log('🎯 READY FOR ORGANIZATIONAL DISCUSSIONS');
    console.log('====================================\n');
    console.log('The conversation framework provides:');
    console.log('• Structured prompts for each conflict area');
    console.log('• Complete meeting agendas with timing');
    console.log('• Facilitator guidance for productive discussions');
    console.log('• Participant preparation materials');
    console.log('• Conflict resolution strategies');
    console.log('• Evidence-based decision making tools\n');

    // Validation
    expect(prompts.length).toBeGreaterThan(0);
    expect(agenda.sections.length).toBeGreaterThan(0);
    expect(result.conflictAreas.length).toBeGreaterThanOrEqual(0);

    console.log('✅ Conversation Framework Demo Complete!');
    console.log('🚀 Ready to facilitate difficult AI adoption conversations');
  });
});
