import { AggregatedWeatherData } from "./aggregate-weather-data.util"; // Adjust import path as needed

export module EmailTemplateUtils {
  export function buildWeatherEmail(data: AggregatedWeatherData): string {
    const { date, summary, details, meta } = data;

    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
  <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; border-bottom: 2px solid #e9ecef; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="margin: 0; color: #2c3e50; font-size: 28px;">🌤️ Weather Summary</h1>
      <div style="color: #6c757d; font-size: 16px; margin-top: 5px;">${formatDate(date)}</div>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
      <div style="font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center; margin-bottom: 10px;">
        ${summary.minTemp}° - ${summary.maxTemp}°C
      </div>
      <div style="text-align: center; font-size: 18px; color: #495057; text-transform: capitalize;">
        ${summary.condition}
      </div>
      <div style="text-align: center; margin-top: 10px; color: #6c757d;">
        Average: ${summary.avgTemp}°C
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
        <div style="font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">💧 Humidity</div>
        <div style="font-size: 16px; color: #2c3e50;">
          ${details.humidity.min}% - ${details.humidity.max}%<br>
          <small style="color: #6c757d;">Avg: ${details.humidity.avg}%</small>
        </div>
      </div>
      
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
        <div style="font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">💨 Wind</div>
        <div style="font-size: 16px; color: #2c3e50;">
          Max: ${details.wind.max} km/h<br>
          <small style="color: #6c757d;">Avg: ${details.wind.avg} km/h</small>
        </div>
      </div>
      
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
        <div style="font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🌡️ Pressure</div>
        <div style="font-size: 16px; color: #2c3e50;">
          ${details.pressure.min} - ${details.pressure.max} mb<br>
          <small style="color: #6c757d;">Avg: ${details.pressure.avg} mb</small>
        </div>
      </div>
      
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
        <div style="font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">☀️ UV Index</div>
        <div style="font-size: 16px; color: #2c3e50;">
          Max: ${details.uv.max}<br>
          <small style="color: #6c757d;">Avg: ${details.uv.avg}</small>
        </div>
      </div>
      
      ${
        details.totalPrecipitation > 0
          ? `
      <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px;">
        <div style="font-weight: bold; color: #495057; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🌧️ Precipitation</div>
        <div style="font-size: 16px; color: #2c3e50;">${details.totalPrecipitation} mm</div>
      </div>
      `
          : ""
      }
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 12px;">
      Based on ${meta.dataPoints} data points collected throughout the day
    </div>
  </div>
</div>`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  export function getEmailSubject(data: AggregatedWeatherData): string {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `🌤️ Weather Summary for ${formattedDate} - ${data.summary.minTemp}°-${data.summary.maxTemp}°C`;
  }
}
