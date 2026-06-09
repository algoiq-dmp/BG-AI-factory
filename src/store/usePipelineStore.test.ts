/**
 * @file Pipeline Store Tests
 * @description Unit tests for the 12-stage pipeline Zustand store
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { usePipelineStore } from '@/store/usePipelineStore';

describe('usePipelineStore', () => {
  beforeEach(() => {
    usePipelineStore.getState().resetPipeline();
  });

  it('should start with idle status', () => {
    const state = usePipelineStore.getState();
    expect(state.status).toBe('idle');
    expect(state.stages).toHaveLength(12);
    expect(state.currentStageIndex).toBe(0);
    expect(state.progress).toBe(0);
  });

  it('should have 12 named stages', () => {
    const { stages } = usePipelineStore.getState();
    expect(stages[0].name).toBe('Requirements AI');
    expect(stages[11].name).toBe('Quality Audit');
    stages.forEach((s) => {
      expect(s.status).toBe('idle');
      expect(s.output).toBe('');
    });
  });

  it('should start pipeline and set first stage to running', () => {
    usePipelineStore.getState().startPipeline();

    const state = usePipelineStore.getState();
    expect(state.status).toBe('running');
    expect(state.stages[0].status).toBe('running');
    expect(state.stages[0].startedAt).toBeDefined();
    expect(state.startedAt).toBeDefined();
  });

  it('should complete a stage and advance to next', () => {
    usePipelineStore.getState().startPipeline();
    usePipelineStore.getState().completeStage(1, 'Requirements output');

    const state = usePipelineStore.getState();
    expect(state.stages[0].status).toBe('done');
    expect(state.stages[0].output).toBe('Requirements output');
    expect(state.stages[0].completedAt).toBeDefined();
    expect(state.stages[1].status).toBe('running');
    expect(state.currentStageIndex).toBe(1);
    expect(state.progress).toBe(Math.round((1 / 12) * 100));
  });

  it('should mark pipeline as completed when all stages done', () => {
    usePipelineStore.getState().startPipeline();

    for (let i = 1; i <= 12; i++) {
      usePipelineStore.getState().completeStage(i, `Stage ${i} output`);
    }

    const state = usePipelineStore.getState();
    expect(state.status).toBe('completed');
    expect(state.progress).toBe(100);
    state.stages.forEach((s) => expect(s.status).toBe('done'));
  });

  it('should handle stage errors', () => {
    usePipelineStore.getState().startPipeline();
    usePipelineStore.getState().errorStage(1, 'API timeout');

    const state = usePipelineStore.getState();
    expect(state.stages[0].status).toBe('error');
    expect(state.stages[0].output).toBe('API timeout');
    expect(state.status).toBe('error');
  });

  it('should pause and resume', () => {
    usePipelineStore.getState().startPipeline();
    usePipelineStore.getState().pausePipeline();
    expect(usePipelineStore.getState().status).toBe('paused');

    usePipelineStore.getState().resumePipeline();
    expect(usePipelineStore.getState().status).toBe('running');
  });

  it('should reset pipeline to initial state', () => {
    usePipelineStore.getState().startPipeline();
    usePipelineStore.getState().completeStage(1, 'output');
    usePipelineStore.getState().resetPipeline();

    const state = usePipelineStore.getState();
    expect(state.status).toBe('idle');
    expect(state.progress).toBe(0);
    expect(state.currentStageIndex).toBe(0);
    expect(state.elapsedSeconds).toBe(0);
  });

  it('should tick elapsed time', () => {
    usePipelineStore.getState().startPipeline();
    usePipelineStore.getState().tick();
    usePipelineStore.getState().tick();
    usePipelineStore.getState().tick();
    expect(usePipelineStore.getState().elapsedSeconds).toBe(3);
  });

  it('should set individual stage status', () => {
    usePipelineStore.getState().setStageStatus(5, 'skipped');
    expect(usePipelineStore.getState().stages[4].status).toBe('skipped');
  });
});
