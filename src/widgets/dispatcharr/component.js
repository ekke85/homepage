import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatBytes(bytes) {
  if (typeof bytes !== "number") return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}
function formatBitrateKbps(val) {
  if (typeof val !== "number") return "";
  if (val < 1000) return val.toFixed(0) + " kbps";
  return (val / 1000).toFixed(2) + " Mbps";
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  // Multi-API fetch
  const { data, error } = useWidgetAPI(widget, "status");
  const { data: version, error: versionError } = useWidgetAPI(widget, "version");
  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "channels");
  const { data: groupsData, error: groupsError } = useWidgetAPI(widget, "groups");

  if (error || versionError || channelsError || groupsError) {
    return <Container service={service} error={error || versionError || channelsError || groupsError} />;
  }

  if (!data || !version || !channelsData || !groupsData) {
    return (
      <Container service={service}>
        <div className="flex gap-2 mb-2">
          <Block label="Version" />
          <Block label="Channels" />
          <Block label="Groups" />
        </div>
      </Container>
    );
  }

  // Counts
  const numChannels = Array.isArray(channelsData)
    ? channelsData.length
    : (channelsData?.channels?.length || 0);
  const numGroups = Array.isArray(groupsData)
    ? groupsData.length
    : (groupsData?.groups?.length || 0);

  return (
    <Container service={service}>
      <div className="flex flex-col w-full">
        {/* Version, Channels, Groups */}
        <div className="flex gap-2 mb-2">
          <Block label="Version" value={version?.version || version} />
          <Block label="Channels" value={t("common.number", { value: numChannels })} />
          <Block label="Groups" value={t("common.number", { value: numGroups })} />
        </div>
        {/* Streams */}
        {Array.isArray(data.channels) && data.channels.length > 0 && (
          <div className="flex flex-col gap-1 w-full">
            {data.channels.map((ch) => (
              <div
                key={ch.channel_id + ch.stream_name}
                className="text-theme-700 dark:text-theme-200 rounded-md bg-theme-200/50 dark:bg-theme-900/20 px-2 py-1 flex items-center text-xs w-full"
                style={{ minHeight: "28px" }}
              >
                <span className="font-semibold">{ch.stream_name}</span>
                <span className="mx-2">–</span>
                <span>{formatBitrateKbps(ch.avg_bitrate_kbps)}</span>
                <span className="mx-2">–</span>
                <span>{formatBytes(ch.total_bytes)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
