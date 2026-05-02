import Plot from 'react-plotly.js'; 
import { ChartData } from '../../types';

interface ChartSettings {
    showLabels: boolean;
    angle: number;
    fontSize: number;
}

export const DashboardWidgetPlot: React.FC<{ chart: ChartData, settings: ChartSettings }> = ({ chart, settings }) => {
    
    // Вычисляем длину самого длинного слова в названиях колонок (если они есть)
    let maxLabelLength = 10; // дефолтное значение
    if (chart.type === 'pairplot' && chart.data.dimensions) {
        maxLabelLength = Math.max(...chart.data.dimensions.slice(0, 4).map((d: any) => d.label?.length || 0));
    }

    const angleRad = (settings.angle * Math.PI) / 180;
    const labelHeightSpace = settings.showLabels ? (maxLabelLength * settings.fontSize * Math.sin(angleRad) / 2) + settings.fontSize + 20 : 10;
    const labelWidthSpace = settings.showLabels ? (maxLabelLength * settings.fontSize * 0.6) + 30 : 10; // 0.6 - примерное соотношение ширины символа к высоте

    let plotData: any[] = [];
    let plotLayout: any = {
        margin: { 
            t: 5, 
            b: chart.type === 'pairplot' ? labelHeightSpace : (settings.showLabels ? 10  : 10), 
            l: chart.type === 'pairplot' ? labelWidthSpace : (settings.showLabels ? 10 : 10), 
            r: 5 
        },
        xaxis: { 
            automargin: true, 
            tickfont: { size: settings.fontSize }, 
            visible: true, showgrid: false, zeroline: false,
            showticklabels: settings.showLabels,
            tickangle: -settings.angle 
        },
        yaxis: { 
            automargin: true, 
            tickfont: { size: settings.fontSize }, 
            visible: true, showgrid: false, zeroline: false,
            showticklabels: settings.showLabels
        },
        font: { size: settings.fontSize, color: '#18181b' },
        showlegend: false, autosize: true,
        plot_bgcolor: 'transparent', paper_bgcolor: 'transparent'
    };

    try {
        switch (chart.type) {
            case 'correlation':
                const cols = Object.keys(chart.data);
                const z = cols.map(c1 => cols.map(c2 => Number(chart.data[c1][c2])));
                const text = z.map(row => row.map(val => val.toFixed(2)));
                plotData = [{ 
                    z, x: cols, y: cols, type: 'heatmap', colorscale: 'RdBu', showscale: false,
                    text: text, texttemplate: "%{text}", textfont: { size: settings.fontSize }
                }];
                plotLayout.yaxis.autorange = 'reversed'; 
                break;
            case 'category_count':
            case 'numeric_hist':
                const isNum = chart.type === 'numeric_hist';
                plotData = [{ x: isNum ? chart.data.x : Object.keys(chart.data.counts), y: isNum ? chart.data.y : Object.values(chart.data.counts), type: 'bar', marker: { color: isNum ? '#e27c4a' : '#4a90e2' } }];
                break;
            case 'trend_line':
                plotData = chart.data.numeric_cols.slice(0, 3).map((col: string) => ({ x: chart.data.x, y: chart.data.y[col], type: 'scatter', mode: 'lines', name: col }));
                break;
            case 'pairplot':
                const dimensions = chart.data.dimensions.slice(0, 4);
                const numDims = dimensions.length;
                plotData = [{ 
                    type: 'splom', 
                    dimensions: dimensions.map((d:any)=>({ ...d, label: '' })), 
                    marker: { size: 2, color: '#4a90e2' } 
                }];
                
                const annotations: any[] = [];
                if (settings.showLabels) {
                    dimensions.forEach((dim: any, i: number) => {
                        annotations.push({
                            xref: 'paper', yref: 'paper',
                            x: -0.02, y: 1 - ((i + 0.5) / numDims), 
                            xanchor: 'right', yanchor: 'middle',
                            text: dim.label, showarrow: false, font: { size: settings.fontSize, color: '#18181b' }
                        });
                        annotations.push({
                            xref: 'paper', yref: 'paper',
                            x: (i + 0.5) / numDims, y: -0.02, 
                            xanchor: 'right', yanchor: 'top',
                            textangle: -settings.angle, 
                            text: dim.label, showarrow: false, font: { size: settings.fontSize, color: '#18181b' }
                        });
                    });
                }
                plotLayout.annotations = annotations;

                for (let i = 1; i <= 4; i++) {
                    const ax = i === 1 ? '' : i;
                    plotLayout[`xaxis${ax}`] = { automargin: true, showticklabels: settings.showLabels, tickfont: { size: Math.max(8, settings.fontSize - 2) }, showgrid: false, tickangle: 0 };
                    plotLayout[`yaxis${ax}`] = { automargin: true, showticklabels: settings.showLabels, tickfont: { size: Math.max(8, settings.fontSize - 2) }, showgrid: false, tickangle: 0 };
                }
                break;
            case 'feature_importances':
                plotData = [{ type: 'bar', orientation: 'h', x: chart.data.importances, y: chart.data.features, marker: { color: '#328fec' } }];
                break;
            case 'dependency':
                if (chart.data.sub_type === 'scatter') plotData = [{ x: chart.data.x, y: chart.data.y, type: 'scatter', mode: 'markers', marker: { size: 3, color: '#4a90e2' } }];
                else if (chart.data.sub_type === 'heatmap') plotData = [{ z: chart.data.z, x: chart.data.x, y: chart.data.y, type: 'heatmap', colorscale: 'Blues', showscale: false }];
                else if (chart.data.sub_type === 'box') plotData = chart.data.categories.map((cat:string, i:number) => ({ y: chart.data.values[i], type: 'box', name: cat }));
                break;
            case 'outliers':
                plotData = [{ y: chart.data.y, type: 'box', name: '', marker: {color: '#e74c3c'} }];
                plotLayout.xaxis.showticklabels = false;
                break;
            case 'feature_tree':
                plotData = chart.data.icoord.map((x: number[], i: number) => ({ x, y: chart.data.dcoord[i], type: 'scatter', mode: 'lines', line: { color: '#a0aec0' } }));
                if (settings.showLabels) {
                    plotLayout.xaxis.tickvals = chart.data.ivl.map((_: any, idx: number) => idx * 10 + 5);
                    plotLayout.xaxis.ticktext = chart.data.ivl;
                }
                break;
        }
    } catch (e) { console.error("Plot error", e); }

    return (
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
            <Plot data={plotData} layout={plotLayout} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%', height: '100%' }} useResizeHandler={true} />
        </div>
    );
};