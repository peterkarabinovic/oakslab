CREATE TABLE startups.stages(
    startup_id UUID,
    stage_id INTEGER NOT NULL,
    step_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    PRIMARY KEY(startup_id, stage_id, step_id)
);