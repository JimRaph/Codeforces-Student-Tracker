import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface Props {
  submissionHeatmap: Record<string, number>;
}

interface HeatmapValue {
  date: string | Date;
  count?: number;
}

const SubmissionHeatmap: React.FC<Props> = ({ submissionHeatmap }) => {
  const values: HeatmapValue[] = Object.entries(submissionHeatmap).map(([date, count]) => ({
    date,
    count,
  }));

  const classForValue = (value: HeatmapValue | undefined): string => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count! < 3) return 'color-scale-1';
    if (value.count! < 6) return 'color-scale-2';
    if (value.count! < 10) return 'color-scale-3';
    return 'color-scale-4';
  };

  const tooltipDataAttrs = (value: HeatmapValue | undefined): { [key: string]: string } => {
    if (!value?.date) return { 'data-tip': '' };
    return {
      'data-tip': `${value.date}: ${value.count ?? 0} submission${value.count !== 1 ? 's' : ''}`,
    };
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Submission Heatmap</h3>
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        values={values}
        classForValue={classForValue}
        tooltipDataAttrs={tooltipDataAttrs}
        showWeekdayLabels
      />
    </div>
  );
};

export default SubmissionHeatmap;
